# LLM Gateway

LLM Gateway 是一个基于 Fastify + Supabase 的后端 API 项目，作为 OpenRouter 的通用代理网关，提供 DID 认证和智能请求转发服务。

## 核心特性

- 通用 OpenRouter API 代理与路径转发
- DID 去中心化身份认证
- **自动用户初始化**：新用户首次访问时自动创建记录和 API Key
- API Key 安全加密管理
- **智能 Usage Tracking**：自动记录请求的 tokens 消耗和费用
- 请求日志与使用统计
- 流式/非流式响应支持

## 🆕 Usage Tracking 功能

LLM Gateway 集成了 OpenRouter 的 Usage Accounting 功能，可以自动跟踪和记录：

### 自动数据收集

- **Token 计数**：自动记录 prompt tokens 和 completion tokens
- **费用统计**：精确记录每次请求的成本（以 USD 计算）
- **模型信息**：记录使用的具体模型名称
- **请求状态**：跟踪请求成功/失败状态

### 支持的端点

- `/chat/completions` - Chat 对话接口
- `/completions` - 文本补全接口

### 流式和非流式支持

- **非流式请求**：从响应体中直接提取 usage 信息
- **流式请求**：智能解析 SSE 流中的 usage 数据（通常在最后一个 chunk 中）

### 数据持久化

所有 usage 数据自动保存到 `request_logs` 表中：

```sql
-- Usage tracking 相关字段
input_tokens INTEGER,        -- prompt tokens 数量
output_tokens INTEGER,       -- completion tokens 数量
total_cost DECIMAL(10,6),    -- 总费用（USD）
```

### 透明化操作

- 用户无需任何额外配置，系统自动启用 usage tracking
- 对现有 API 调用完全透明，不影响原有功能
- 自动处理 OpenRouter 的 credits 到 USD 的转换（1 credit = $0.000001）

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

-- 请求日志表（已包含 Usage Tracking 字段）
CREATE TABLE request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  did TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,                    -- 输入 tokens 数量
  output_tokens INTEGER,                   -- 输出 tokens 数量
  total_cost DECIMAL(10,6),               -- 总费用（USD）
  request_time TIMESTAMP WITH TIME ZONE NOT NULL,
  response_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_request_logs_did ON request_logs(did);
CREATE INDEX idx_request_logs_request_time ON request_logs(request_time);
CREATE INDEX idx_request_logs_status ON request_logs(status);
CREATE INDEX idx_request_logs_model ON request_logs(model);
CREATE INDEX idx_request_logs_cost ON request_logs(total_cost);
```

## 主要 API 端点

- `GET /` 或 `/api/v1/health`：健康检查
- `<METHOD> /api/v1/openrouter/*`：通用 OpenRouter 代理（需 DID 认证）
- `GET /api/v1/usage`：获取用户使用统计（需 DID 认证）

### OpenRouter 代理逻辑简介

- 所有 `/api/v1/openrouter/*` 路径的请求均由 `handleOpenRouterProxy` 统一处理：
  - 校验 DID 身份与签名
  - 根据 DID 在数据库中查找并解密用户 API Key
  - **自动启用 Usage Tracking**：为支持的端点添加 `usage: { include: true }` 参数
  - 转发请求到 OpenRouter 对应 API 路径
  - 支持流式和非流式响应，自动转发响应头和状态码
  - **智能提取 Usage 信息**：从响应中解析 tokens 和费用数据
  - **自动记录日志**：将 usage 信息保存到数据库
  - 失败时自动回滚日志并返回错误信息

## 示例

### 基础 Chat Completion 请求（自动启用 Usage Tracking）

```bash
curl -X POST http://localhost:3000/api/v1/openrouter/chat/completions \
  -H "x-did: did:example:123" \
  -H "x-did-signature: ..." \
  -H "x-did-timestamp: ..." \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello! How are you?"}
    ]
  }'
```

### 流式请求（同样支持 Usage Tracking）

```bash
curl -X POST http://localhost:3000/api/v1/openrouter/chat/completions \
  -H "x-did: did:example:123" \
  -H "x-did-signature: ..." \
  -H "x-did-timestamp: ..." \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Write a short story about AI"}
    ],
    "stream": true
  }'
```

### 查看使用统计

```bash
curl -X GET http://localhost:3000/api/v1/usage \
  -H "x-did: did:example:123" \
  -H "x-did-signature: ..." \
  -H "x-did-timestamp: ..."
```

## 🔍 Usage Tracking 日志示例

系统会在控制台输出详细的 usage tracking 信息：

```
✅ Usage tracking enabled for request
📊 Extracted usage info: {
  input_tokens: 12,
  output_tokens: 85,
  total_cost: 0.000142
}
```

在数据库中的记录示例：

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "did": "did:example:123",
  "model": "openai/gpt-3.5-turbo",
  "input_tokens": 12,
  "output_tokens": 85,
  "total_cost": 0.000142,
  "status": "completed",
  "request_time": "2024-01-20T10:30:00Z",
  "response_time": "2024-01-20T10:30:02Z"
}
```

## TODO

- DID 签名验证
- Usage 报告和分析功能
- 费用预警和限制机制

## 环境变量配置

创建 `.env` 文件并配置以下环境变量：

```env
# 服务配置
PORT=3000
NODE_ENV=development

# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter 配置
OPENROUTER_API_URL=https://openrouter.ai/api/v1
OPENROUTER_PROVISIONING_KEY=your_openrouter_provisioning_key

# API Key 加密
API_KEY_ENCRYPTION_KEY=your_encryption_key_change_in_production

# 可选配置
HTTP_REFERER=https://llm-gateway.local
X_TITLE=LLM Gateway
```

### 关键配置说明

- `OPENROUTER_PROVISIONING_KEY`：用于在 OpenRouter 自动创建用户 API Key 的管理密钥
- `API_KEY_ENCRYPTION_KEY`：用于加密存储用户 API Key 的密钥，生产环境必须更改

## 用户自动初始化功能

当新用户首次通过 DID 认证访问系统时，Gateway 会自动：

1. **检查用户是否存在**：查询数据库中是否有该用户的记录
2. **创建 OpenRouter API Key**：如果用户不存在，自动在 OpenRouter 创建新的 API Key
3. **保存用户记录**：将用户信息和加密后的 API Key 保存到数据库
4. **错误处理**：如果创建过程中出现错误，会自动清理已创建的资源

这个过程对用户完全透明，无需手动注册或配置。

## 🎯 特性对比

| 特性           | 传统方式             | LLM Gateway         |
| -------------- | -------------------- | ------------------- |
| Usage Tracking | 需要手动配置和解析   | ✅ 自动启用和提取   |
| 流式支持       | 复杂的流解析逻辑     | ✅ 智能流数据处理   |
| 费用计算       | 需要手动转换 credits | ✅ 自动转换为 USD   |
| 数据持久化     | 需要额外开发         | ✅ 自动保存到数据库 |
| 错误处理       | 容易遗漏边界情况     | ✅ 完善的异常处理   |
