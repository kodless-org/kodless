import { deleteConcept } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  const { name, concept } = event.context.params!;
  return await deleteConcept(name, concept);
});
