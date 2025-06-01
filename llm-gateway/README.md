# LLM Gateway

LLM Gateway 是一个基于 Fastify + Supabase 的后端 API 项目，作为 OpenRouter 的通用代理网关，提供 DID 认证和智能请求转发服务。

## 核心特性

- 通用 OpenRouter API 代理与路径转发
- DID 去中心化身份认证
- API Key 安全加密管理
- 请求日志与使用统计
- 流式/非流式响应支持

## 目录结构

```
llm-gateway/
├── src/
│   ├── types/           # 类型定义
│   ├── database/        # Supabase 数据库操作
│   ├── services/        # 业务逻辑服务
│   ├── middleware/      # 认证中间件
│   ├── routes/          # API 路由
│   └── index.ts         # 应用入口
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

1. 安装依赖：`npm install`
2. 配置 `.env` 环境变量（见下方示例）
3. 运行开发环境：`npm run dev`

## 数据库初始化

在 Supabase 创建以下两张表：

```sql
-- 用户 API Key 表
CREATE TABLE user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  did TEXT NOT NULL UNIQUE,
  openrouter_key_hash TEXT NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  key_name TEXT NOT NULL,
  credit_limit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_user_api_keys_did ON user_api_keys(did);
CREATE INDEX idx_user_api_keys_hash ON user_api_keys(openrouter_key_hash);

-- 请求日志表
CREATE TABLE request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  did TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_cost DECIMAL(10,6),
  request_time TIMESTAMP WITH TIME ZONE NOT NULL,
  response_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_request_logs_did ON request_logs(did);
CREATE INDEX idx_request_logs_request_time ON request_logs(request_time);
CREATE INDEX idx_request_logs_status ON request_logs(status);
```

## 主要 API 端点

- `GET /` 或 `/api/v1/health`：健康检查
- `<METHOD> /api/v1/openrouter/*`：通用 OpenRouter 代理（需 DID 认证）
- `GET /api/v1/usage`：获取用户使用统计（需 DID 认证）

### OpenRouter 代理逻辑简介

- 所有 `/api/v1/openrouter/*` 路径的请求均由 `handleOpenRouterProxy` 统一处理：
  - 校验 DID 身份与签名
  - 根据 DID 在数据库中查找并解密用户 API Key
  - 转发请求到 OpenRouter 对应 API 路径
  - 支持流式和非流式响应，自动转发响应头和状态码
  - 对产生费用的请求自动记录日志（如 tokens、cost 等）
  - 失败时自动回滚日志并返回错误信息

## 示例

```bash
# Chat Completion 代理
curl -X POST http://localhost:3000/api/v1/openrouter/chat/completions \
  -H "x-did: did:example:123" -H "x-did-signature: ..." -H "x-did-timestamp: ..." \
  -d '{"model": "openai/gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## TODO

- DID 签名验证
