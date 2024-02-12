import { getProjectFiles } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getProjectFiles(event.context.params?.name!);
})