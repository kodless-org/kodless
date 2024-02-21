import { updateAppDefinition } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  const project = event.context.params?.name!;
  const { prompt } = await readBody(event);
  if (!prompt) {
    throw createError({
      status: 400,
      statusMessage: "Missing prompt",
    });
  }
  return await updateAppDefinition(project, prompt);
});
