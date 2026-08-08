import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contactSubmissions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const contactRouter = createRouter({
  // Public - create contact submission (lead generation)
  create: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        phone: z.string().min(1, "Phone number is required"),
        propertyType: z.enum(["villa", "apartment", "exhibition", "commercial"]),
        serviceType: z.enum(["full_finishing", "tv_units", "walls", "flooring", "doors"]),
        propertyArea: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(contactSubmissions).values({
        fullName: input.fullName,
        phone: input.phone,
        propertyType: input.propertyType,
        serviceType: input.serviceType,
        propertyArea: input.propertyArea ?? null,
        message: input.message ?? null,
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  // Admin only - list all submissions
  list: adminQuery
    .query(async () => {
      const db = getDb();
      const submissions = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
      return submissions;
    }),

  // Admin only - update status
  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "in_progress", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(contactSubmissions)
        .set({ status: input.status })
        .where(eq(contactSubmissions.id, input.id));
      return { success: true };
    }),

  // Admin only - delete submission
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contactSubmissions).where(eq(contactSubmissions.id, input.id));
      return { success: true };
    }),
});
