import { Router, Request, Response } from "express";
import SupabaseService from "../database/supabase";
import { ApiResponse, RequestLog, DIDInfo } from "../types";
import OpenRouterService from "../services/openrouter";
import { authMiddleware } from "../middleware/auth";
import { userInitMiddleware } from "../middleware/userInit";
import { parse } from "url";
import { setImmediate } from "timers";

const supabaseService = new SupabaseService();
const openRouterService = new OpenRouterService();
const router = Router();

// 定义支持的 HTTP 方法
const SUPPORTED_METHODS = ["get", "post", "put", "delete", "patch"] as const;

// 通用 OpenRouter 代理路由 - 支持所有路径和方法
for (const method of SUPPORTED_METHODS) {
  router[method](
    "/*",
    authMiddleware,
    userInitMiddleware,
    async (req: Request, res: Response) => {
      return handleOpenRouterProxy(req, res);
    }
  );
}

export const llmRoutes = router;

// 通用的 OpenRouter 代理处理函数
async function handleOpenRouterProxy(
  req: Request,
  res: Response
): Promise<void> {
  const requestTime = new Date().toISOString();
  const didInfo = req.didInfo as DIDInfo;
  const method = req.method;

  // 只取 pathname 部分
  const { pathname } = parse(req.url);

  // 只传递路径部分，不拼接 baseURL
  const apiPath = pathname || "";

  // 获取请求数据并启用 usage tracking
  let requestData = ["GET", "DELETE"].includes(method) ? undefined : req.body;

  // 为支持的端点启用 usage tracking
  if (
    requestData &&
    (apiPath.includes("/chat/completions") || apiPath.includes("/completions"))
  ) {
    requestData = {
      ...requestData,
      usage: {
        include: true,
      },
    };
    console.log("✅ Usage tracking enabled for request");
  }

  // 检查是否为流式请求
  const isStream = (requestData as any)?.stream || false;

  // 确定模型名称（用于日志记录）
  const model = (requestData as any)?.model || "unknown";

  console.log(
    `📨 Received ${method} request to ${req.url}, forwarding to OpenRouter: ${apiPath}`
  );

  // Usage tracking 数据
  let usageData: {
    input_tokens?: number;
    output_tokens?: number;
    total_cost?: number;
  } = {};

  // 异步日志更新函数，不阻塞主流程
  const asyncUpdateLog = (logData: any) => {
    setImmediate(async () => {
      try {
        await supabaseService.updateRequestLog(
          didInfo.did,
          requestTime,
          logData
        );
      } catch (error) {
        console.error("Error updating request log:", error);
      }
    });
  };

  // 从响应中提取 usage 信息
  const extractUsageInfo = (responseData: any) => {
    if (responseData && responseData.usage) {
      const usage = responseData.usage;
      usageData = {
        input_tokens: usage.prompt_tokens || 0,
        output_tokens: usage.completion_tokens || 0,
        total_cost: usage.cost ?? undefined, // 直接存储 usage.cost，单位为美元
      };
      console.log("📊 Extracted usage info:", usageData);
      return usageData;
    }
    return null;
  };

  // 处理流式响应中的 usage 信息
  let streamUsageBuffer = "";
  const extractStreamUsage = (chunk: string) => {
    // 在流式响应中，usage 信息通常在最后的 chunk 中
    streamUsageBuffer += chunk;

    // 查找包含 usage 信息的行
    const lines = streamUsageBuffer.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ") && line.includes('"usage"')) {
        try {
          const data = JSON.parse(line.slice(6)); // 移除 'data: ' 前缀
          if (data.usage) {
            const extracted = extractUsageInfo(data);
            if (extracted) {
              console.log("📊 Extracted usage info from stream:", extracted);
              return extracted;
            }
          }
        } catch (error) {
          // 忽略解析错误，继续处理
        }
      }
    }
    return null;
  };

  try {
    // 1. 获取用户的实际 API Key（从加密存储中获取）
    const apiKey = await supabaseService.getUserActualApiKey(didInfo.did);
    if (!apiKey) {
      const response: ApiResponse = {
        success: false,
        error: "User API key not found",
      };
      res.status(404).json(response);
      return;
    }

    // 2. 记录请求开始（仅对 POST 等可能产生费用的请求记录）
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const requestLog: Omit<RequestLog, "id"> = {
        did: didInfo.did,
        model: model,
        request_time: requestTime,
        status: "pending",
      };
      // 异步记录，不等待完成
      setImmediate(async () => {
        try {
          await supabaseService.logRequest(requestLog);
        } catch (error) {
          console.error("Error logging request:", error);
        }
      });
    }

    // 3. 转发请求到 OpenRouter
    const response = await openRouterService.forwardRequest(
      apiKey,
      apiPath,
      method,
      requestData,
      isStream
    );

    if (!response) {
      // 异步更新请求日志为失败状态
      if (["POST", "PUT", "PATCH"].includes(method)) {
        asyncUpdateLog({
          status: "failed",
          error_message: "Failed to forward request to OpenRouter",
          response_time: new Date().toISOString(),
        });
      }

      const errorResponse: ApiResponse = {
        success: false,
        error: "Failed to process request",
      };
      res.status(500).json(errorResponse);
      return;
    }

    // 4. 处理响应
    if (isStream) {
      // 流式响应处理 - Express 对流的支持更好
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Transfer-Encoding", "chunked");

      // 添加响应状态跟踪
      let requestLogUpdated = false;

      // 安全的日志更新函数（异步，不阻塞流）
      const safeUpdateLog = (logData: any) => {
        if (!requestLogUpdated && ["POST", "PUT", "PATCH"].includes(method)) {
          requestLogUpdated = true;
          asyncUpdateLog({
            ...logData,
            ...usageData, // 包含 usage 信息
          });
        }
      };

      // Express 中的流处理更加直观和稳定
      try {
        // 设置错误处理
        response.data.on("error", (error: Error) => {
          console.error("OpenRouter stream error:", error);
          safeUpdateLog({
            status: "failed",
            error_message: error.message,
            response_time: new Date().toISOString(),
          });
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: "Stream error" });
          }
        });

        res.on("error", (error: Error) => {
          console.error("Response stream error:", error);
        });

        res.on("close", () => {
          console.log("Client disconnected");
          response.data.destroy(); // 清理上游流
        });

        // 处理流数据并提取 usage 信息
        let streamBuffer = "";
        response.data.on("data", (chunk: Buffer) => {
          const chunkStr = chunk.toString();
          streamBuffer += chunkStr;

          // 尝试提取 usage 信息
          const extracted = extractStreamUsage(chunkStr);
          if (extracted) {
            Object.assign(usageData, extracted);
          }

          // 转发数据到客户端
          if (!res.destroyed) {
            res.write(chunk);
          }
        });

        // 监听流结束
        response.data.on("end", () => {
          console.log("Stream completed successfully");
          if (!res.destroyed) {
            res.end();
          }
          safeUpdateLog({
            status: "completed",
            response_time: new Date().toISOString(),
          });
        });
      } catch (error) {
        console.error("Stream setup error:", error);
        safeUpdateLog({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Stream setup failed",
          response_time: new Date().toISOString(),
        });
        if (!res.headersSent) {
          res
            .status(500)
            .json({ success: false, error: "Stream processing failed" });
        }
      }
    } else {
      // 非流式响应处理
      const responseData = openRouterService.parseResponse(response);

      // 提取 usage 信息
      extractUsageInfo(responseData);

      // 设置响应状态码
      res.status(response.status);

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
          res.setHeader(headerName, headerValue);
        }
      });

      // 发送响应
      res.json(responseData);

      // 异步更新请求日志为完成状态，包含 usage 信息
      if (["POST", "PUT", "PATCH"].includes(method)) {
        asyncUpdateLog({
          status: "completed",
          response_time: new Date().toISOString(),
          ...usageData, // 包含提取的 usage 信息
        });
      }
    }
  } catch (error) {
    console.error("OpenRouter proxy error:", error);

    // 异步更新请求日志为失败状态
    if (["POST", "PUT", "PATCH"].includes(method)) {
      asyncUpdateLog({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        response_time: new Date().toISOString(),
      });
    }

    const errorResponse: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    if (!res.headersSent) {
      res.status(500).json(errorResponse);
    }
  }
}
