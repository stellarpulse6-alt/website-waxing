import { mysqlTable, int, date, time, mysqlEnum, text, timestamp } from "drizzle-orm/mysql-core";
import { customers } from "./customers";
import { services } from "./services";

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull().references(() => customers.id),
  serviceId: int("service_id").notNull().references(() => services.id),
  bookingDate: date("booking_date").notNull(),
  bookingTime: time("booking_time").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
