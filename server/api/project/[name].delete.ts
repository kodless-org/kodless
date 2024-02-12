import { deleteProject } from "~/server/manager";

export default defineEventHandler(async (event) => {
  return await deleteProject(event.context.params?.name!);
});