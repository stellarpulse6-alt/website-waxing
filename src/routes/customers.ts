import { Elysia, t } from "elysia";
import { db } from "../db";
import { customers } from "../db/schema";
import { eq } from "drizzle-orm";

export const customersRoutes = new Elysia({ prefix: "/api/customers" })
  .get("/", async () => {
    const result = await db.select().from(customers);
    return { success: true, data: result };
  })
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const result = await db.select().from(customers).where(eq(customers.id, Number(id))).limit(1);
      if (result.length === 0) {
        set.status = 404;
        return { success: false, message: "Customer not found" };
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
      const insertResult = await db.insert(customers).values({
        name: body.name,
        phone: body.phone,
        email: body.email,
      });

      set.status = 201;
      return {
        success: true,
        message: "Customer created successfully",
        data: { id: insertResult[0].insertId, ...body },
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        phone: t.String({ minLength: 1 }),
        email: t.Optional(t.String({ format: "email" })),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      const existing = await db.select().from(customers).where(eq(customers.id, Number(id))).limit(1);
      if (existing.length === 0) {
        set.status = 404;
        return { success: false, message: "Customer not found" };
      }

      await db
        .update(customers)
        .set({
          ...(body.name !== undefined && { name: body.name }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.email !== undefined && { email: body.email }),
        })
        .where(eq(customers.id, Number(id)));

      return { success: true, message: "Customer updated successfully" };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        phone: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
      }),
    }
  );
