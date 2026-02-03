import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';
import { HttpError } from './errors/http-error';

const app: Application = express();

// Middleware
// CORS configuration for Next.js frontend
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(`${config.apiPrefix}/auth`, authRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Backend is running ✅" });
});

// Health check
app.get(`${config.apiPrefix}/health`, (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📍 API base: http://localhost:${config.port}${config.apiPrefix}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
