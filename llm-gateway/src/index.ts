import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express, { Request, Response } from "express";
import cors from "cors";
import { llmRoutes } from "./routes/llm";
import { usageRoutes } from "./routes/usage";

const app = express();

async function start() {
  try {
    // 配置 CORS
    app.use(
      cors({
        origin: true, // 在生产环境中应该设置具体的域名
        credentials: true,
      })
    );

    // 配置解析中间件
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true }));

    // 注册路由
    app.use("/api/v1", llmRoutes);
    app.use("/usage", usageRoutes);

    // 根路径健康检查
    app.get("/", (req: Request, res: Response) => {
      res.json({
        service: "Nuwa LLM Gateway",
        version: "1.0.0",
        status: "running",
        timestamp: new Date().toISOString(),
      });
    });

    // 启动服务器
    const port = parseInt(process.env.PORT || "3000");
    const host = process.env.HOST || "0.0.0.0";

    const server = app.listen(port, host, () => {
      console.log(`🚀 LLM Gateway server is running on http://${host}:${port}`);
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      server.close((err?: Error) => {
        if (err) {
          console.error("❌ Error during shutdown:", err);
          process.exit(1);
        } else {
          console.log("✅ Server closed successfully");
          process.exit(0);
        }
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

// 启动应用
start();
