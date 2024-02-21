import { updateConcept } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  const { name, concept } = event.context.params!;
  const { prompt } = await readBody(event);
  if (!prompt) {
    throw createError({
      status: 400,
      statusMessage: "Missing prompt",
    });
  }
  return await updateConcept(name, concept, prompt);
});
