import { getRoutes } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getRoutes(event.context.params?.name!);
});