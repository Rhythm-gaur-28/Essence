const request = require("supertest");
const app = require("../server");

describe("Auth Routes", () => {

  // 1
  test("Login route should reject invalid user", async () => {

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(400);
  });

  // 2
  test("Login should reject empty credentials", async () => {

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "",
        password: ""
      });

    expect([400, 500]).toContain(res.statusCode);
  });

  // 3
  test("Protected /me route should reject request without token", async () => {

    const res = await request(app)
      .get("/api/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe("No token");
  });

  // 4
  test("Protected /me route should reject invalid token", async () => {

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer fake_invalid_token");

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe("Invalid token");
  });

});