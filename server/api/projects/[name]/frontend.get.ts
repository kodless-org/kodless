import { getFrontend } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getFrontend(event.context.params?.name!);
});
