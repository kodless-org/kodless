import { installDependencies } from "../../../manager";

export default defineEventHandler(async (event) => {
  return installDependencies(event.context.params?.name!);
});
