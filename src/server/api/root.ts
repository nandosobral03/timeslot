import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import * as userProcedures from "@/server/api/routers/users";
import * as stationProcedures from "@/server/api/routers/stations";
import * as tagProcedures from "@/server/api/routers/tags";
import * as videoProcedures from "@/server/api/routers/videos";
import * as scheduleProcedures from "@/server/api/routers/schedule";
import * as chatProcedures from "@/server/api/routers/chat";
import * as youtubeProcedures from "@/server/api/routers/youtube";
import * as homepageProcedures from "@/server/api/routers/homepage";
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
  chat: createTRPCRouter(chatProcedures),
  youtube: createTRPCRouter(youtubeProcedures),
  homepage: createTRPCRouter(homepageProcedures),
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
