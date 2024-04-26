import { importConcept } from "~/server/project/concept-store";

export default defineEventHandler(async (event) => {
  const { project, concept } = await readBody(event);

  return await importConcept(project, concept);
});
