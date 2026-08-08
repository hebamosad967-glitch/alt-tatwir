import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { portfolioImages } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const portfolioRouter = createRouter({
  // Public - list all images
  list: publicQuery
    .query(async () => {
      const db = getDb();
      const images = await db.select().from(portfolioImages).orderBy(desc(portfolioImages.createdAt));
      return images;
    }),

  // Public - get single image
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [image] = await db.select().from(portfolioImages).where(eq(portfolioImages.id, input.id));
      return image ?? null;
    }),

  // Admin only - create image
  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        category: z.enum(["villa", "apartment", "exhibition", "commercial", "bedroom", "living", "kitchen", "bathroom", "majlis", "other"]),
        imageUrl: z.string().min(1, "Image URL is required"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(portfolioImages).values({
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        imageUrl: input.imageUrl,
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  // Admin only - update image
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.enum(["villa", "apartment", "exhibition", "commercial", "bedroom", "living", "kitchen", "bathroom", "majlis", "other"]).optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(portfolioImages)
        .set(updates)
        .where(eq(portfolioImages.id, id));
      return { success: true };
    }),

  // Admin only - delete image
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(portfolioImages).where(eq(portfolioImages.id, input.id));
      return { success: true };
    }),
});
