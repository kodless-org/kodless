import { runProject } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return runProject(event.context.params?.name!);
})