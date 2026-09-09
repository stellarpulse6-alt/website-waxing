import { Elysia, t } from "elysia";
import { db } from "../db";
import { services } from "../db/schema";
import { eq } from "drizzle-orm";

export const servicesRoutes = new Elysia({ prefix: "/api/services" })
  .get("/", async () => {
    const result = await db.select().from(services).where(eq(services.isActive, true));
    return { success: true, data: result };
  })
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const result = await db.select().from(services).where(eq(services.id, Number(id))).limit(1);
      if (result.length === 0) {
        set.status = 404;
        return { success: false, message: "Service not found" };
      }
      return { success: true, data: result[0] };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      const insertResult = await db.insert(services).values({
        name: body.name,
        description: body.description,
        price: body.price.toString(),
        durationMinutes: body.durationMinutes,
        isActive: body.isActive ?? true,
      });

      set.status = 201;
      return {
        success: true,
        message: "Service created successfully",
        data: { id: insertResult[0].insertId, ...body },
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        price: t.Number({ minimum: 0 }),
        durationMinutes: t.Number({ minimum: 1 }),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      const existing = await db.select().from(services).where(eq(services.id, Number(id))).limit(1);
      if (existing.length === 0) {
        set.status = 404;
        return { success: false, message: "Service not found" };
      }

      await db
        .update(services)
        .set({
          ...(body.name !== undefined && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.price !== undefined && { price: body.price.toString() }),
          ...(body.durationMinutes !== undefined && { durationMinutes: body.durationMinutes }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        })
        .where(eq(services.id, Number(id)));

      return { success: true, message: "Service updated successfully" };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
        price: t.Optional(t.Number({ minimum: 0 })),
        durationMinutes: t.Optional(t.Number({ minimum: 1 })),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      const existing = await db.select().from(services).where(eq(services.id, Number(id))).limit(1);
      if (existing.length === 0) {
        set.status = 404;
        return { success: false, message: "Service not found" };
      }

      // Soft delete: set isActive = false
      await db.update(services).set({ isActive: false }).where(eq(services.id, Number(id)));

      return { success: true, message: "Service deactivated successfully" };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
