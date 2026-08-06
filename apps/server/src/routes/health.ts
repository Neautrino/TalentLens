import { Hono } from "hono";

export const healthRouter = new Hono();

healthRouter.get("/", (c) => {
  console.log("Health check request")
  return c.json({
    status: "ok",
    service: "talentlens-server",
    timestamp: new Date().toISOString(),
  });
});