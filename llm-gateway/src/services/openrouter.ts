import axios, { AxiosResponse } from "axios";
import {
  LLMRequest,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  GetApiKeyResponse,
} from "../types";

interface CurrentApiKeyResponse {
  data: {
    label: string;
    usage: number;
    is_free_tier: boolean;
    is_provisioning_key: boolean;
    limit: number;
    limit_remaining: number;
  };
}

interface DeleteApiKeyResponse {
  data: {
    success: boolean;
  };
}

class OpenRouterService {
  private baseURL: string;
  private provisioningApiKey: string | null;

  constructor() {
    this.baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai";
    this.provisioningApiKey = process.env.OPENROUTER_PROVISIONING_KEY || null;
  }

  // 统一处理 axios 错误日志
  private logAxiosError(context: string, error: any): void {
    if (error.response) {
      // 请求已发出，服务器返回了状态码
      console.error(
        `[${context}] HTTP ${error.response.status}: ${error.response.statusText}`
      );
      if (error.response.data) {
        console.error(`[${context}] Response data:`, error.response.data);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error(`[${context}] No response received.`);
    } else {
      // 其他错误
      console.error(`[${context}] Error:`, error.message);
    }
    // 可选：开发环境下输出详细堆栈
    if (process.env.NODE_ENV === "development" && error.stack) {
      console.error(`[${context}] Stack:`, error.stack);
    }
  }

  // Create a new OpenRouter API Key
  async createApiKey(
    request: CreateApiKeyRequest
  ): Promise<CreateApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }

    try {
      const response = await axios.post<CreateApiKeyResponse>(
        `${this.baseURL}/api/v1/keys`,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Created OpenRouter API key: ${request.name}`);
      return response.data;
    } catch (error: any) {
      this.logAxiosError("Error creating OpenRouter API key", error);
      return null;
    }
  }

  // Get API key metadata by hash (won't return the actual key)
  async getApiKeyFromHash(keyHash: string): Promise<GetApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const response = await axios.get<GetApiKeyResponse>(
        `${this.baseURL}/api/v1/keys/${keyHash}`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      this.logAxiosError("Error getting OpenRouter API key info", error);
      return null;
    }
  }

  // Get current API key information (only for current Bearer Token)
  async getCurrentApiKey(): Promise<CurrentApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const response = await axios.get<CurrentApiKeyResponse>(
        `${this.baseURL}/api/v1/key`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      this.logAxiosError(
        "Error getting current OpenRouter API key info",
        error
      );
      return null;
    }
  }

  // Update API key information (name, disabled status, limit)
  async updateApiKey(
    keyHash: string,
    update: { name?: string; disabled?: boolean; limit?: number }
  ): Promise<GetApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const response = await axios.patch<GetApiKeyResponse>(
        `${this.baseURL}/api/v1/keys/${keyHash}`,
        update,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      this.logAxiosError("Error updating OpenRouter API key", error);
      return null;
    }
  }

  // List all API Keys (supports offset/include_disabled parameters)
  async listApiKeys(
    offset?: number,
    include_disabled?: boolean
  ): Promise<GetApiKeyResponse[] | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const params: any = {};
      if (offset !== undefined) params.offset = offset;
      if (include_disabled !== undefined)
        params.include_disabled = include_disabled;

      const response = await axios.get<{ data: GetApiKeyResponse[] }>(
        `${this.baseURL}/api/v1/keys`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
          params,
        }
      );
      return response.data.data;
    } catch (error: any) {
      this.logAxiosError("Error listing OpenRouter API keys", error);
      return null;
    }
  }

  // Delete API Key
  async deleteApiKey(keyHash: string): Promise<boolean> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return false;
    }

    try {
      const response = await axios.delete<DeleteApiKeyResponse>(
        `${this.baseURL}/api/v1/keys/${keyHash}`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Deleted OpenRouter API key: ${keyHash}`);
      return response.data.data.success;
    } catch (error: any) {
      this.logAxiosError("Error deleting OpenRouter API key", error);
      return false;
    }
  }

  // 通用转发请求到 OpenRouter - 支持任意路径
  async forwardRequest(
    apiKey: string,
    apiPath: string,
    method: string = "POST",
    requestData?: any,
    isStream: boolean = false
  ): Promise<AxiosResponse | null> {
    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.HTTP_REFERER || "https://llm-gateway.local",
        "X-Title": process.env.X_TITLE || "LLM Gateway",
      };

      // 始终拼接 baseURL 和 apiPath
      const fullUrl = `${this.baseURL}/api/v1${apiPath}`;

      console.log(`🔄 Forwarding ${method} request to: ${fullUrl}`);

      const response = await axios({
        method: method.toLowerCase() as any,
        url: fullUrl,
        data: requestData,
        headers,
        responseType: isStream ? "stream" : "json",
      });

      return response;
    } catch (error: any) {
      this.logAxiosError("Error forwarding request to OpenRouter", error);
      return null;
    }
  }

  // 兼容旧版本的方法，内部调用新的通用方法
  async forwardChatRequest(
    apiKey: string,
    request: LLMRequest,
    isStream: boolean = false
  ): Promise<AxiosResponse | null> {
    return this.forwardRequest(
      apiKey,
      "/chat/completions",
      "POST",
      request,
      isStream
    );
  }

  // 处理流式响应
  async handleStreamResponse(
    response: AxiosResponse,
    onData: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      let streamEnded = false;
      let errorHandled = false;

      // 安全的错误处理函数
      const safeOnError = (error: Error) => {
        if (!errorHandled) {
          errorHandled = true;
          streamEnded = true;
          onError(error);
        }
      };

      // 安全的结束处理函数
      const safeOnEnd = () => {
        if (!streamEnded && !errorHandled) {
          streamEnded = true;
          onEnd();
        }
      };

      response.data.on("data", (chunk: Buffer) => {
        if (!streamEnded && !errorHandled) {
          try {
            const chunkStr = chunk.toString();
            onData(chunkStr);
          } catch (error) {
            safeOnError(error as Error);
          }
        }
      });

      response.data.on("end", () => {
        safeOnEnd();
      });

      response.data.on("error", (error: Error) => {
        safeOnError(error);
      });

      // 添加超时处理（可选）
      response.data.on("close", () => {
        if (!streamEnded && !errorHandled) {
          console.log("Stream closed unexpectedly");
          safeOnEnd();
        }
      });
    } catch (error) {
      onError(error as Error);
    }
  }

  // 更简单的管道式流处理（推荐用于简单透传）
  pipeStreamResponse(
    response: AxiosResponse,
    targetStream: NodeJS.WritableStream,
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): void {
    // 使用默认管道设置，让 Node.js 自动管理流的结束
    const sourceStream = response.data;

    // 设置错误处理
    sourceStream.on("error", (error: Error) => {
      console.error("Source stream error:", error);
      onError?.(error);
    });

    targetStream.on("error", (error: Error) => {
      console.error("Target stream error:", error);
      onError?.(error);
    });

    // 使用管道并在完成时调用回调
    sourceStream.pipe(targetStream);

    // 监听源流结束事件
    sourceStream.on("end", () => {
      console.log("Source stream ended");
      onEnd?.();
    });

    // 监听管道结束事件
    sourceStream.on("close", () => {
      console.log("Source stream closed");
    });
  }

  // 解析非流式响应
  parseResponse(response: AxiosResponse): any {
    try {
      return response.data;
    } catch (error) {
      console.error("Error parsing OpenRouter response:", error);
      return null;
    }
  }
}

export default OpenRouterService;
