import { uninstallDependencies } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return uninstallDependencies(event.context.params?.name!);
})