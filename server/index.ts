import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Error handler middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  log(`Error: ${message} (Status: ${status})`);
  res.status(status).json({ message });
  // Don't throw here - just log the error
});

// Main server startup function with error handling
async function startServer() {
  try {
    // Validate required environment variables
    const nodeEnv = process.env.NODE_ENV || 'development';
    log(`Starting server in ${nodeEnv} mode`);

    // Register API routes
    const server = await registerRoutes(app);
    
    // Setup Vite for development or serve static files for production
    if (nodeEnv === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Ensure port is valid
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${process.env.PORT || '5000'}`);
    }

    // Start the server with proper error handling
    return new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`Server successfully started on port ${port}`);
        resolve();
      });

      // Handle server startup errors
      serverInstance.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${port} is already in use`);
          reject(new Error(`Port ${port} is already in use`));
        } else {
          log(`Server error: ${err.message}`);
          reject(err);
        }
      });

      // Handle process termination signals for graceful shutdown
      process.on('SIGTERM', () => {
        log('SIGTERM received, shutting down gracefully');
        serverInstance.close(() => {
          log('Process terminated');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        log('SIGINT received, shutting down gracefully');
        serverInstance.close(() => {
          log('Process terminated');
          process.exit(0);
        });
      });
    });

  } catch (error: any) {
    log(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  log(`Unhandled error during server startup: ${error.message}`);
  console.error(error);
  process.exit(1);
});
