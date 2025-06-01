import axios, { AxiosResponse } from "axios";
import {
  LLMRequest,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  GetApiKeyResponse,
} from "../types";

class OpenRouterService {
  private baseURL: string;
  private provisioningApiKey: string | null;

  constructor() {
    this.baseURL =
      process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    this.provisioningApiKey = process.env.OPENROUTER_PROVISIONING_KEY || null;
  }

  // 创建新的 OpenRouter API Key
  async createApiKey(
    request: CreateApiKeyRequest
  ): Promise<CreateApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }

    try {
      const response = await axios.post<CreateApiKeyResponse>(
        `${this.baseURL}/keys`,
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
    } catch (error) {
      console.error("Error creating OpenRouter API key:", error);
      return null;
    }
  }

  // 获取 API Key 信息（通过 hash）
  async getApiKeyInfo(keyHash: string): Promise<GetApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }

    try {
      // TODO: 需要确认 OpenRouter 是否提供通过 hash 获取 key 信息的 API
      const response = await axios.get<GetApiKeyResponse>(
        `${this.baseURL}/keys/${keyHash}`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting OpenRouter API key info:", error);
      return null;
    }
  }

  // 通过 hash 从 OpenRouter 获取 API key 元信息（不会返回明文 key）
  async getApiKeyFromHash(keyHash: string): Promise<GetApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const response = await axios.get<GetApiKeyResponse>(
        `${this.baseURL}/keys/${keyHash}`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting OpenRouter API key info:", error);
      return null;
    }
  }

  // 获取当前 session 的 API Key 信息（仅限当前 Bearer Token）
  async getCurrentApiKey(): Promise<any | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const response = await axios.get(`${this.baseURL}/key`, {
        headers: {
          Authorization: `Bearer ${this.provisioningApiKey}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting current OpenRouter API key info:", error);
      return null;
    }
  }

  // 更新 API Key 信息（如名称、禁用、额度）
  async updateApiKey(
    keyHash: string,
    update: { name?: string; disabled?: boolean; limit?: number }
  ): Promise<GetApiKeyResponse | null> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return null;
    }
    try {
      const response = await axios.patch<{ data: GetApiKeyResponse }>(
        `${this.baseURL}/keys/${keyHash}`,
        update,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating OpenRouter API key:", error);
      return null;
    }
  }

  // 列出所有 API Keys（支持 offset/include_disabled 参数）
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
        `${this.baseURL}/keys`,
        {
          headers: {
            Authorization: `Bearer ${this.provisioningApiKey}`,
            "Content-Type": "application/json",
          },
          params,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error listing OpenRouter API keys:", error);
      return null;
    }
  }

  // 删除 API Key
  async deleteApiKey(keyHash: string): Promise<boolean> {
    if (!this.provisioningApiKey) {
      console.error("Provisioning API key not configured");
      return false;
    }

    try {
      await axios.delete(`${this.baseURL}/keys/${keyHash}`, {
        headers: {
          Authorization: `Bearer ${this.provisioningApiKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`✅ Deleted OpenRouter API key: ${keyHash}`);
      return true;
    } catch (error) {
      console.error("Error deleting OpenRouter API key:", error);
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

      // 构建完整的 OpenRouter URL
      const fullUrl = `${this.baseURL}${apiPath}`;

      console.log(`🔄 Forwarding ${method} request to: ${fullUrl}`);

      const response = await axios({
        method: method.toLowerCase() as any,
        url: fullUrl,
        data: requestData,
        headers,
        responseType: isStream ? "stream" : "json",
      });

      return response;
    } catch (error) {
      console.error("Error forwarding request to OpenRouter:", error);
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
      response.data.on("data", (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        onData(chunkStr);
      });

      response.data.on("end", () => {
        onEnd();
      });

      response.data.on("error", (error: Error) => {
        onError(error);
      });
    } catch (error) {
      onError(error as Error);
    }
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

  // TODO: 实现使用计费相关的方法
  async getUsageInfo(apiKey: string): Promise<any> {
    // TODO: 获取使用情况和计费信息
    console.log("TODO: getUsageInfo not implemented", apiKey);
    return null;
  }
}

export default OpenRouterService;
