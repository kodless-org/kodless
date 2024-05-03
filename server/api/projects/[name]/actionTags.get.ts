import { generateActionTags } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  return await generateActionTags(event.context.params?.name!);
});
