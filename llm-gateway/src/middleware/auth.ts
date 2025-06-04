import { Request, Response, NextFunction } from "express";
import DIDService from "../services/did";
import { ApiResponse } from "../types";

const didService = new DIDService();

// 扩展 Request 类型以包含 didInfo
declare global {
  namespace Express {
    interface Request {
      didInfo?: any;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 提取 DID 信息
    const didInfo = didService.extractDIDFromRequest(req.headers);

    if (!didInfo) {
      const response: ApiResponse = {
        success: false,
        error: "Missing DID information in request headers",
      };
      res.status(401).json(response);
      return;
    }

    // 验证 DID 格式
    if (!didService.isValidDIDFormat(didInfo.did)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid DID format",
      };
      res.status(400).json(response);
      return;
    }

    // 验证 DID
    const isValid = await didService.validateDID(didInfo);
    if (!isValid) {
      const response: ApiResponse = {
        success: false,
        error: "DID validation failed",
      };
      res.status(401).json(response);
      return;
    }

    // 将 DID 信息添加到请求对象中，供后续处理使用
    req.didInfo = didInfo;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Authentication error",
    };
    res.status(500).json(response);
  }
}
