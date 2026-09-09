import { Elysia, t } from "elysia";
import { db } from "../db";
import { bookings } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const bookingsRoutes = new Elysia({ prefix: "/api/bookings" })
  .get(
    "/",
    async ({ query }) => {
      const filters = [];
      if (query.status) {
        filters.push(eq(bookings.status, query.status));
      }
      if (query.date) {
        filters.push(eq(bookings.bookingDate, query.date));
      }

      const result = filters.length > 0
        ? await db.select().from(bookings).where(and(...filters))
        : await db.select().from(bookings);

      return { success: true, data: result };
    },
    {
      query: t.Object({
        status: t.Optional(t.Union([
          t.Literal("pending"),
          t.Literal("confirmed"),
          t.Literal("completed"),
          t.Literal("cancelled")
        ])),
        date: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const result = await db.select().from(bookings).where(eq(bookings.id, Number(id))).limit(1);
      if (result.length === 0) {
        set.status = 404;
        return { success: false, message: "Booking not found" };
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
      const insertResult = await db.insert(bookings).values({
        customerId: body.customerId,
        serviceId: body.serviceId,
        bookingDate: body.bookingDate,
        bookingTime: body.bookingTime,
        status: body.status ?? "pending",
        notes: body.notes,
      });

      set.status = 201;
      return {
        success: true,
        message: "Booking created successfully",
        data: { id: insertResult[0].insertId, ...body },
      };
    },
    {
      body: t.Object({
        customerId: t.Number(),
        serviceId: t.Number(),
        bookingDate: t.String(),
        bookingTime: t.String(),
        status: t.Optional(t.Union([
          t.Literal("pending"),
          t.Literal("confirmed"),
          t.Literal("completed"),
          t.Literal("cancelled")
        ])),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      const existing = await db.select().from(bookings).where(eq(bookings.id, Number(id))).limit(1);
      if (existing.length === 0) {
        set.status = 404;
        return { success: false, message: "Booking not found" };
      }

      await db
        .update(bookings)
        .set({
          ...(body.customerId !== undefined && { customerId: body.customerId }),
          ...(body.serviceId !== undefined && { serviceId: body.serviceId }),
          ...(body.bookingDate !== undefined && { bookingDate: body.bookingDate }),
          ...(body.bookingTime !== undefined && { bookingTime: body.bookingTime }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.notes !== undefined && { notes: body.notes }),
        })
        .where(eq(bookings.id, Number(id)));

      return { success: true, message: "Booking updated successfully" };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        customerId: t.Optional(t.Number()),
        serviceId: t.Optional(t.Number()),
        bookingDate: t.Optional(t.String()),
        bookingTime: t.Optional(t.String()),
        status: t.Optional(t.Union([
          t.Literal("pending"),
          t.Literal("confirmed"),
          t.Literal("completed"),
          t.Literal("cancelled")
        ])),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      const existing = await db.select().from(bookings).where(eq(bookings.id, Number(id))).limit(1);
      if (existing.length === 0) {
        set.status = 404;
        return { success: false, message: "Booking not found" };
      }

      await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, Number(id)));

      return { success: true, message: "Booking cancelled successfully" };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
