import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./routes/auth.route";
import bookingRoutes from "./routes/booking.route";
import adminRoutes from "./routes/admin.route";
import adminUsersRoutes from "./routes/admin.users.route";
import { HttpError } from "./errors/http-error";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUsersRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default app;
