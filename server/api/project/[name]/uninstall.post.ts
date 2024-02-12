import { uninstallDependencies } from "../../../manager";

export default defineEventHandler(async (event) => {
  return uninstallDependencies(event.context.params?.name!);
});
