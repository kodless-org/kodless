import { getProjectEnvironment } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getProjectEnvironment(event.context.params?.name!);
})
