import { authRouter } from "./auth-router";
import { reservationRouter } from "./reservation-router";
import { portfolioRouter } from "./portfolio-router";
import { contactRouter } from "./contact-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  reservation: reservationRouter,
  portfolio: portfolioRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
