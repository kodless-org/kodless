import { installDependencies } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return installDependencies(event.context.params?.name!);
})