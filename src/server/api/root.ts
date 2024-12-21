import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import * as userProcedures from "@/server/api/routers/users";
import * as stationProcedures from "@/server/api/routers/stations";
import * as tagProcedures from "@/server/api/routers/tags";
import * as videoProcedures from "@/server/api/routers/videos";
import * as scheduleProcedures from "@/server/api/routers/schedule";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: createTRPCRouter(userProcedures),
  stations: createTRPCRouter(stationProcedures),
  tags: createTRPCRouter(tagProcedures),
  videos: createTRPCRouter(videoProcedures),
  schedule: createTRPCRouter(scheduleProcedures),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
