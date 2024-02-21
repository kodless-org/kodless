import { getAppDefinition } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getAppDefinition(event.context.params?.name!);
});