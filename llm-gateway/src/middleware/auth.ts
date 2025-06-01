import { FastifyRequest, FastifyReply } from "fastify";
import DIDService from "../services/did";
import { ApiResponse } from "../types";

const didService = new DIDService();

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // 提取 DID 信息
    const didInfo = didService.extractDIDFromRequest(request.headers);

    if (!didInfo) {
      const response: ApiResponse = {
        success: false,
        error: "Missing DID information in request headers",
      };
      return reply.status(401).send(response);
    }

    // 验证 DID 格式
    if (!didService.isValidDIDFormat(didInfo.did)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid DID format",
      };
      return reply.status(400).send(response);
    }

    // 验证 DID
    const isValid = await didService.validateDID(didInfo);
    if (!isValid) {
      const response: ApiResponse = {
        success: false,
        error: "DID validation failed",
      };
      return reply.status(401).send(response);
    }

    // 将 DID 信息添加到请求对象中，供后续处理使用
    (request as any).didInfo = didInfo;
  } catch (error) {
    console.error("Auth middleware error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Authentication error",
    };
    return reply.status(500).send(response);
  }
}
