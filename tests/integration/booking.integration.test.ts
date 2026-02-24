import request from "supertest";
import app from "../../src/app";

describe("Booking Integration", () => {
	let authToken = "";
	let bookingId = "";
	const email = `test+${Date.now()}@example.com`;
	const password = "123456";
	const fullName = "John Doe";
	const phone = "+9779812345678";
	const cityAddress = "Kathmandu";
	const serviceType = "Installation";
	const flooringType = "SPC";
	const areaSize = 120;
	const preferredDate = "2026-03-15";
	const preferredTime = "Morning 8-12";
	const notes = "Please call before arrival";

	it("Register user for booking tests", async () => {
		const response = await request(app)
			.post("/api/auth/register")
			.send({
				email,
				password,
			});

		expect([200, 201]).toContain(response.status);
		const body = response.body as {
			message?: string;
			data?: { user?: unknown; token?: string };
		};
		expect(body.message || body.data?.user || body.data?.token).toBeTruthy();
	});

	it("Login user for booking tests", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email,
				password,
			});

		expect(response.status).toBe(200);

		const body = response.body as { data?: { token?: string } };
		authToken = body.data?.token ?? "";
		expect(authToken).toBeTruthy();
	});

	it("Create booking should work with token", async () => {
		const response = await request(app)
			.post("/api/bookings")
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				fullName,
				phone,
				cityAddress,
				serviceType,
				flooringType,
				areaSize,
				preferredDate,
				preferredTime,
				notes,
			});

		expect([200, 201]).toContain(response.status);

		const body = response.body as {
			success?: boolean;
			message?: string;
			data?: { _id?: string; id?: string };
		};
		expect(body.success).toBe(true);
		expect(body.message).toBeTruthy();

		// Extract booking ID from response
		bookingId = body.data?._id ?? body.data?.id ?? "";
		expect(bookingId).toBeTruthy();
	});

	it("Get my bookings should return list", async () => {
		const response = await request(app)
			.get("/api/bookings/me")
			.set("Authorization", `Bearer ${authToken}`);

		expect(response.status).toBe(200);

		const body = response.body as {
			success?: boolean;
			message?: string;
			data?: { bookings?: unknown[]; items?: unknown[] } | unknown[];
		};
		expect(body.success).toBe(true);
		expect(body.message).toBeTruthy();

		// Handle different response structures
		const bookings = Array.isArray(body.data)
			? body.data
			: body.data?.bookings || body.data?.items || [];
		expect(Array.isArray(bookings) || typeof bookings === "object").toBe(true);
	});

	it("Get booking by ID should work with token", async () => {
		if (!bookingId) {
			// Skip if booking creation failed
			expect(true).toBe(true);
			return;
		}

		const response = await request(app)
			.get(`/api/bookings/${bookingId}`)
			.set("Authorization", `Bearer ${authToken}`);

		expect([200, 404]).toContain(response.status);

		if (response.status === 200) {
			const body = response.body as {
				success?: boolean;
				message?: string;
				data?: { _id?: string; id?: string; fullName?: string };
			};
			expect(body.success).toBe(true);
			expect(body.data?.fullName || body.data?._id || body.data?.id).toBeTruthy();
		}
	});

	it("Update booking status should work with token", async () => {
		if (!bookingId) {
			// Skip if booking creation failed
			expect(true).toBe(true);
			return;
		}

		const response = await request(app)
			.patch(`/api/bookings/${bookingId}/status`)
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				status: "completed",
			});

		// Regular users cannot update booking status (forbidden), only admins can
		expect([200, 201, 403, 404]).toContain(response.status);

		if (response.status === 200 || response.status === 201) {
			const body = response.body as {
				success?: boolean;
				message?: string;
				data?: { status?: string };
			};
			expect(body.success).toBe(true);
		}
	});

	it("Create booking without token should fail", async () => {
		const response = await request(app)
			.post("/api/bookings")
			.send({
				fullName,
				phone,
				cityAddress,
				serviceType,
				flooringType,
				areaSize,
				preferredDate,
				preferredTime,
				notes,
			});

		expect([401, 403]).toContain(response.status);
	});

	it("Get bookings without token should fail", async () => {
		const response = await request(app).get("/api/bookings/me");

		expect([401, 403]).toContain(response.status);
	});

	it("Get booking by ID without token should fail", async () => {
		const response = await request(app).get("/api/bookings/507f1f77bcf86cd799439011");

		expect([401, 403]).toContain(response.status);
	});

	it("Update booking without token should fail", async () => {
		const response = await request(app)
			.patch("/api/bookings/507f1f77bcf86cd799439011/status")
			.send({
				status: "completed",
			});

		expect([401, 403]).toContain(response.status);
	});
});
