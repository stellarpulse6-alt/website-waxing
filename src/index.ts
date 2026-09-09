import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { servicesRoutes } from "./routes/services";
import { customersRoutes } from "./routes/customers";
import { bookingsRoutes } from "./routes/bookings";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: "public",
    prefix: "",
  }))
  .get("/", () => Bun.file("public/index.html"))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .use(servicesRoutes)
  .use(customersRoutes)
  .use(bookingsRoutes)
  .listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
