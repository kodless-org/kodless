import { getConcept } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await getConcept(
    event.context.params?.name!,
    event.context.params?.concept!
  );
})