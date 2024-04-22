import { getConceptStore } from "~/server/project/concept-store";

export default defineEventHandler(async () => {
  return await getConceptStore();
});
