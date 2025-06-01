import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import SupabaseService from "../database/supabase";
import { authMiddleware } from "../middleware/auth";
import { ApiResponse, RequestLog, DIDInfo } from "../types";
import OpenRouterService from "../services/openrouter";

const supabaseService = new SupabaseService();
const openRouterService = new OpenRouterService();

// 定义支持的 HTTP 方法
const SUPPORTED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

export async function llmRoutes(fastify: FastifyInstance) {
  // 健康检查路由（不需要认证）
  fastify.get("/health", async (request, reply) => {
    const response: ApiResponse = {
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
    };
    return reply.send(response);
  });

  // 通用 OpenRouter 代理路由 - 支持所有路径和方法
  for (const method of SUPPORTED_METHODS) {
    fastify.route({
      method,
      url: "/openrouter/*",
      preHandler: authMiddleware,
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        return handleOpenRouterProxy(request, reply);
      },
    });
  }

  // 获取用户使用情况的路由
  fastify.get(
    "/usage",
    {
      preHandler: authMiddleware,
    },
    async (request, reply: FastifyReply) => {
      const didInfo = (request as any).didInfo as DIDInfo;
      const { start_date, end_date } = request.query as {
        start_date?: string;
        end_date?: string;
      };

      try {
        const usageStats = await supabaseService.getUserUsageStats(
          didInfo.did,
          start_date,
          end_date
        );

        if (!usageStats) {
          const response: ApiResponse = {
            success: false,
            error: "Failed to get usage statistics",
          };
          return reply.status(500).send(response);
        }

        const response: ApiResponse = {
          success: true,
          data: usageStats,
        };

        return reply.send(response);
      } catch (error) {
        console.error("Error getting usage statistics:", error);
        const response: ApiResponse = {
          success: false,
          error: "Internal server error",
        };
        return reply.status(500).send(response);
      }
    }
  );
}

// 通用的 OpenRouter 代理处理函数
async function handleOpenRouterProxy(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestTime = new Date().toISOString();
  const didInfo = (request as any).didInfo as DIDInfo;
  const method = request.method;

  // 提取 OpenRouter API 路径（去掉 /openrouter 前缀）
  const originalUrl = request.url;
  const openrouterPath = originalUrl.replace(/^\/openrouter/, "") || "/";

  // 获取请求数据
  const requestData = ["GET", "DELETE"].includes(method)
    ? undefined
    : request.body;

  // 检查是否为流式请求
  const isStream = (requestData as any)?.stream || false;

  // 确定模型名称（用于日志记录）
  const model = (requestData as any)?.model || "unknown";

  console.log(
    `📨 Received ${method} request to ${originalUrl}, forwarding to OpenRouter: ${openrouterPath}`
  );

  try {
    // 1. 获取用户的实际 API Key（从加密存储中获取）
    const apiKey = await supabaseService.getUserActualApiKey(didInfo.did);
    if (!apiKey) {
      const response: ApiResponse = {
        success: false,
        error: "User API key not found",
      };
      return reply.status(404).send(response);
    }

    // 2. 记录请求开始（仅对 POST 等可能产生费用的请求记录）
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const requestLog: Omit<RequestLog, "id"> = {
        did: didInfo.did,
        model: model,
        request_time: requestTime,
        status: "pending",
      };
      await supabaseService.logRequest(requestLog);
    }

    // 3. 转发请求到 OpenRouter
    const response = await openRouterService.forwardRequest(
      apiKey,
      openrouterPath,
      method,
      requestData,
      isStream
    );

    if (!response) {
      // 更新请求日志为失败状态
      if (["POST", "PUT", "PATCH"].includes(method)) {
        await supabaseService.updateRequestLog(didInfo.did, requestTime, {
          status: "failed",
          error_message: "Failed to forward request to OpenRouter",
          response_time: new Date().toISOString(),
        });
      }

      const errorResponse: ApiResponse = {
        success: false,
        error: "Failed to process request",
      };
      return reply.status(500).send(errorResponse);
    }

    // 4. 处理响应
    if (isStream) {
      // 流式响应处理
      reply.type("text/event-stream");
      reply.header("Cache-Control", "no-cache");
      reply.header("Connection", "keep-alive");

      await openRouterService.handleStreamResponse(
        response,
        (chunk) => {
          reply.raw.write(chunk);
        },
        async () => {
          reply.raw.end();
          // 更新请求日志为完成状态
          if (["POST", "PUT", "PATCH"].includes(method)) {
            await supabaseService.updateRequestLog(didInfo.did, requestTime, {
              status: "completed",
              response_time: new Date().toISOString(),
            });
          }
        },
        async (error) => {
          console.error("Stream error:", error);
          reply.raw.end();
          // 更新请求日志为失败状态
          if (["POST", "PUT", "PATCH"].includes(method)) {
            await supabaseService.updateRequestLog(didInfo.did, requestTime, {
              status: "failed",
              error_message: error.message,
              response_time: new Date().toISOString(),
            });
          }
        }
      );
    } else {
      // 非流式响应处理
      const responseData = openRouterService.parseResponse(response);

      // 设置响应状态码和头部
      reply.status(response.status);

      // 复制重要的响应头
      const headersToForward = [
        "content-type",
        "cache-control",
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
      ];
      headersToForward.forEach((headerName) => {
        const headerValue = response.headers[headerName];
        if (headerValue) {
          reply.header(headerName, headerValue);
        }
      });

      // 更新请求日志为完成状态
      if (["POST", "PUT", "PATCH"].includes(method)) {
        // TODO: 从响应中提取 tokens 和 cost 信息
        await supabaseService.updateRequestLog(didInfo.did, requestTime, {
          status: "completed",
          response_time: new Date().toISOString(),
          // input_tokens: responseData.usage?.prompt_tokens,
          // output_tokens: responseData.usage?.completion_tokens,
          // total_cost: responseData.usage?.total_cost
        });
      }

      return reply.send(responseData);
    }
  } catch (error) {
    console.error("OpenRouter proxy error:", error);

    // 更新请求日志为失败状态
    if (["POST", "PUT", "PATCH"].includes(method)) {
      await supabaseService.updateRequestLog(didInfo.did, requestTime, {
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        response_time: new Date().toISOString(),
      });
    }

    const errorResponse: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    return reply.status(500).send(errorResponse);
  }
}
