import { updateProjectEnvironment } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  const { env } = await readBody(event);
  return await updateProjectEnvironment(event.context.params?.name!, env);
});
