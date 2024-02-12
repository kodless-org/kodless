import { deleteProject } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await deleteProject(event.context.params?.name!);
})