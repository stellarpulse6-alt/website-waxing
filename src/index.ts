import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { servicesRoutes } from "./routes/services";
import { customersRoutes } from "./routes/customers";
import { bookingsRoutes } from "./routes/bookings";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(cors())
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { success: false, message: "Validation error", errors: error.all };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Route not found" };
    }
    set.status = 500;
    return { success: false, message: error.message || "Internal server error" };
  })
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .use(servicesRoutes)
  .use(customersRoutes)
  .use(bookingsRoutes)
  .listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
