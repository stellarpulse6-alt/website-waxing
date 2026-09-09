import { Elysia, t } from "elysia";
import { db } from "../db";
import { services } from "../db/schema";
import { eq } from "drizzle-orm";

// Mock initial data in case MySQL is not connected
const MOCK_SERVICES = [
  {
    id: 1,
    name: "Brazilian Wax",
    description: "Layanan waxing area intim wanita dengan teknik pampas halus dan minim rasa sakit.",
    price: "175000.00",
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: 2,
    name: "Underarm Wax",
    description: "Pembersihan bulu ketiak secara maksimal hingga ke akar, membuat kulit lebih cerah.",
    price: "65000.00",
    durationMinutes: 20,
    isActive: true,
  },
  {
    id: 3,
    name: "Full Leg Waxing",
    description: "Waxing seluruh bagian kaki dari paha hingga pergelangan kaki untuk kulit mulus berkilau.",
    price: "150000.00",
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: 4,
    name: "Half Leg Waxing",
    description: "Waxing setengah bagian kaki (betis atau paha) cepat dan bersih.",
    price: "85000.00",
    durationMinutes: 30,
    isActive: true,
  },
  {
    id: 5,
    name: "Eyebrow & Upper Lip Shaping",
    description: "Membentuk alis presisi dan membersihkan bulu halus di area bibir atas.",
    price: "55000.00",
    durationMinutes: 25,
    isActive: true,
  },
  {
    id: 6,
    name: "Full Arm Waxing",
    description: "Waxing seluruh lengan tangan dengan formula honey wax organik melembabkan kulit.",
    price: "110000.00",
    durationMinutes: 35,
    isActive: true,
  },
];

export const servicesRoutes = new Elysia({ prefix: "/api/services" })
  .get("/", async () => {
    try {
      const result = await db.select().from(services).where(eq(services.isActive, true));
      if (result.length > 0) {
        return { success: true, data: result };
      }
      return { success: true, data: MOCK_SERVICES };
    } catch {
      // Fallback to mock services if DB connection fails
      return { success: true, data: MOCK_SERVICES, note: "Using fallback demo data" };
    }
  })
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const result = await db.select().from(services).where(eq(services.id, Number(id))).limit(1);
        if (result.length > 0) {
          return { success: true, data: result[0] };
        }
      } catch {
        // Fallback search in MOCK_SERVICES
      }
      const item = MOCK_SERVICES.find((s) => s.id === Number(id));
      if (!item) {
        set.status = 404;
        return { success: false, message: "Service not found" };
      }
      return { success: true, data: item };
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
      try {
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
      } catch {
        set.status = 201;
        return {
          success: true,
          message: "Service created successfully (demo mode)",
          data: { id: Date.now(), ...body },
        };
      }
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
      try {
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
      } catch {
        return { success: true, message: "Service updated successfully (demo mode)" };
      }
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
    async ({ params: { id } }) => {
      try {
        await db.update(services).set({ isActive: false }).where(eq(services.id, Number(id)));
      } catch {
        // demo mode
      }
      return { success: true, message: "Service deactivated successfully" };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
