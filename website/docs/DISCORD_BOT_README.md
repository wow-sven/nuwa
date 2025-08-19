# Nuwa Discord Bot

这是一个Discord机器人，允许用户通过Discord命令领取Rooch测试网的RGAS。

## 功能

- `/ping` - 简单的ping/pong测试命令
- `/faucet <did>` - 为hub账号领取测试网RGAS，并异步转账50%给指定的用户DID（会@用户）

## 设置

### 1. 环境变量

在项目根目录创建 `.env.local` 文件，添加以下环境变量：

```env
# Discord Bot配置
DISCORD_APP_ID=your_discord_application_id
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_APP_PUBLIC_KEY=your_discord_application_public_key

# Hub账号配置（用于转账）
HUB_PRIVATE_KEY=your_hub_private_key
HUB_DID=did:rooch:your_hub_address
```

### 2. 注册Discord命令

运行以下命令将命令注册到Discord：

```bash
npm run register-discord-commands
```

或者使用pnpm：

```bash
pnpm register-discord-commands
```

### 3. 部署

将应用部署到支持Edge Runtime的平台（如Vercel）。

### 4. 配置Discord Webhook

在Discord开发者门户中，将交互端点URL设置为：
```
https://your-domain.com/api/discord/interactions
```

## 使用方法

### 领取RGAS

用户可以使用以下命令领取测试网RGAS：

```
/faucet did:rooch:your_address_here
```

例如：
```
/faucet did:rooch:rooch1nadavhgvuakjm3ekv8m6t69k494w7q4pkvpdq4szu20xtaphu20q5jr3k5
```

### 响应示例

成功时：
```
🎉 Successfully claimed **50 RGAS** for your DID: `did:rooch:rooch1...`

💰 You can now use this gas for testing on the Rooch testnet!

🎉 Processing RGAS claim and transfer for `did:rooch:rooch1...`...

⏳ Please wait for the confirmation.

---

**Claim & Transfer Successful**

@user 🎉 Successfully claimed **50 RGAS** to hub account and transferred **25 RGAS** to your wallet!

Transaction: `tx_hash_here`
```

失败时：
```
❌ Failed to claim RGAS: Rate limit exceeded

Please try again later or contact support if the issue persists.
```

## 技术细节

- 使用Edge Runtime以获得更好的性能
- 通过Rooch测试网faucet API领取RGAS
- 为hub账号从faucet领取RGAS
- 异步领取RGAS到hub账号
- 异步计算50%的金额转账给用户
- 使用PaymentHubClient进行转账操作
- 异步处理整个流程，提供实时反馈
- 成功时@用户通知
- 支持DID格式验证
- 错误处理和用户友好的消息
- 安全的hub账号管理

## 开发

### 本地开发

1. 安装依赖：
```bash
pnpm install
```

2. 启动开发服务器：
```bash
pnpm dev
```

3. 使用ngrok等工具将本地服务器暴露到公网：
```bash
ngrok http 3000
```

4. 在Discord开发者门户中设置交互端点URL为ngrok URL

### 添加新命令

1. 在 `app/api/discord/interactions/commands.ts` 中定义新命令
2. 在 `app/api/discord/interactions/route.ts` 中处理新命令
3. 运行 `pnpm register-discord-commands` 注册新命令

## 故障排除

### 命令不显示
- 确保已运行 `pnpm register-discord-commands`
- 等待最多1小时让命令在所有服务器中生效
- 检查Discord Bot是否有正确的权限

### 交互失败
- 检查环境变量是否正确设置
- 验证Discord应用公钥是否正确
- 查看服务器日志以获取详细错误信息

### Faucet请求失败
- 检查网络连接
- 验证faucet服务是否可用
- 确认DID格式是否正确 