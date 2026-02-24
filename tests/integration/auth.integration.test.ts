import request from "supertest";
import app from "../../src/app";

describe("Auth Integration", () => {
	let authToken = "";
	const email = `test+${Date.now()}@example.com`;
	const password = "123456";

	it("Register user successfully", async () => {
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

	it("Login user successfully", async () => {
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

	it("Access protected profile with token", async () => {
		const response = await request(app)
			.get("/api/auth/me")
			.set("Authorization", `Bearer ${authToken}`);

		expect(response.status).toBe(200);
		const body = response.body as { user?: unknown; data?: { user?: unknown } };
		expect(body.user || body.data?.user).toBeTruthy();
	});

	it("Access profile without token should fail", async () => {
		const response = await request(app).get("/api/auth/me");

		expect([401, 403]).toContain(response.status);
	});
});
