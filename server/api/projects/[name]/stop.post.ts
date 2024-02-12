import { stopProject } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return stopProject(event.context.params?.name!);
})