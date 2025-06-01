import fastify from "fastify";
import cors from "@fastify/cors";
import * as dotenv from "dotenv";
import { llmRoutes } from "./routes/llm";

// 加载环境变量
dotenv.config();

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

async function start() {
  try {
    // 注册 CORS 插件
    await app.register(cors, {
      origin: true, // 在生产环境中应该设置具体的域名
      credentials: true,
    });

    // 注册路由
    await app.register(llmRoutes, { prefix: "/api/v1" });

    // 根路径健康检查
    app.get("/", async (request, reply) => {
      return {
        service: "Nuwa LLM Gateway",
        version: "1.0.0",
        status: "running",
        timestamp: new Date().toISOString(),
      };
    });

    // 启动服务器
    const port = parseInt(process.env.PORT || "3000");
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
    console.log(`🚀 LLM Gateway server is running on http://${host}:${port}`);
    console.log(`📚 API available at http://${host}:${port}/api/v1`);
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  try {
    await app.close();
    console.log("✅ Server closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  try {
    await app.close();
    console.log("✅ Server closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// 启动应用
start();
