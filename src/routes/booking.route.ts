import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminOnlyMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.use(authMiddleware);

// Admin routes
router.use('/admin', adminOnlyMiddleware);

// GET /api/bookings/admin
router.get('/admin', (req, res, next) => bookingController.getAllBookingsAdmin(req, res, next));

// GET /api/bookings/admin/:id
router.get('/admin/:id', (req, res, next) => bookingController.getBookingByIdAdmin(req, res, next));

// PATCH /api/bookings/admin/:id/status
router.patch('/admin/:id/status', (req, res, next) => bookingController.updateBookingStatusAdmin(req, res, next));

// DELETE /api/bookings/admin/:id
router.delete('/admin/:id', (req, res, next) => bookingController.deleteBookingAdmin(req, res, next));

// POST /api/bookings
router.post('/', (req, res, next) => bookingController.createBooking(req, res, next));

// GET /api/bookings/me
router.get('/me', (req, res, next) => bookingController.getMyBookings(req, res, next));

// GET /api/bookings/:id
router.get('/:id', (req, res, next) => bookingController.getBookingById(req, res, next));

// PATCH /api/bookings/:id/status
router.patch('/:id/status', (req, res, next) => bookingController.updateBookingStatus(req, res, next));

// DELETE /api/bookings/:id
router.delete('/:id', (req, res, next) => bookingController.deleteBooking(req, res, next));

export default router;

// Example cURL commands:
// Create booking
// curl -X POST "http://localhost:5050/api/bookings" \
//   -H "Authorization: Bearer <token>" \
//   -H "Content-Type: application/json" \
//   -d '{"fullName":"John Doe","phone":"+9779812345678","email":"john@example.com","cityAddress":"Kathmandu","serviceType":"Installation","flooringType":"SPC","areaSize":120,"preferredDate":"2026-02-10","preferredTime":"Morning 8-12","notes":"Please call before arrival"}'
//
// List my bookings
// curl -X GET "http://localhost:5050/api/bookings/me?page=1&limit=10" \
//   -H "Authorization: Bearer <token>"
//
// Update status
// curl -X PATCH "http://localhost:5050/api/bookings/BOOKING_ID/status" \
//   -H "Authorization: Bearer <token>" \
//   -H "Content-Type: application/json" \
//   -d '{"status":"completed"}'
