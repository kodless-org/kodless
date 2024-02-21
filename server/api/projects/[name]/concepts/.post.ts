import { createConcept } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  const project = event.context.params?.name!;
  const { concept, prompt } = await readBody(event);
  return await createConcept(project, concept, prompt);
});
