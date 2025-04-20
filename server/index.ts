import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase, disconnectFromDatabase } from "./db";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { isProduction, serverConfig } from "./config";

const app = express();

// Add security headers with helmet (only in production)
if (isProduction) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://*'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://*'],
      },
    },
  }));
  
  // Add CORS protection in production
  app.use(cors({
    origin: isProduction ? [/\.yourdomain\.com$/] : true, // Replace with your actual domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }));
  
  // Enable gzip compression in production
  app.use(compression());
}

// Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
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

(async () => {
  // Connect to MongoDB
  try {
    await connectToDatabase();
    log("Connected to MongoDB");
  } catch (error) {
    log(`Failed to connect to MongoDB: ${error}`, "error");
    process.exit(1);
  }
  
  const server = await registerRoutes(app);

  // Error handling middleware - improved for production
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // In production, don't expose error details for 500 errors
    const responseMessage = isProduction && status === 500 
      ? "Internal Server Error" 
      : message;
    
    // Log the full error details
    if (status >= 500) {
      log(`ERROR [${status}]: ${message}`, "error");
      if (err.stack) {
        log(`Stack trace: ${err.stack}`, "error");
      }
    } else {
      // For 4xx errors, log with less emphasis
      log(`Warning [${status}]: ${message}`);
    }

    res.status(status).json({ 
      success: false,
      status,
      message: responseMessage,
      ...(isProduction ? {} : { stack: err.stack })
    });

    // Don't throw the error in production, as it may crash the server
    if (!isProduction) {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get port from serverConfig
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const { port, host, reusePort } = serverConfig;
  const httpServer = server.listen({
    port,
    host,
    reusePort,
  }, () => {
    log(`🚀 Server running in ${isProduction ? 'production' : 'development'} mode on port ${port}`);
  });
  
  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    log(`Received ${signal}. Starting graceful shutdown...`);
    
    // Close the HTTP server (stop accepting new connections)
    httpServer.close(() => {
      log('HTTP server closed.');
    });
    
    try {
      // Disconnect from MongoDB gracefully
      await disconnectFromDatabase();
      log('All connections closed gracefully.');
      process.exit(0);
    } catch (error) {
      log(`Error during shutdown: ${error}`, 'error');
      process.exit(1);
    }
  };
  
  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions and unhandled rejections
  if (isProduction) {
    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`, 'error');
      log(error.stack || 'No stack trace available', 'error');
      // In production, we won't crash the server, but will log the error
    });
    
    process.on('unhandledRejection', (reason: any) => {
      log(`Unhandled Rejection: ${reason?.message || reason}`, 'error');
      if (reason?.stack) {
        log(reason.stack, 'error');
      }
      // In production, we won't crash the server, but will log the error
    });
  }
})();
