import { getProjectStatus } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getProjectStatus(event.context.params?.name!);
})