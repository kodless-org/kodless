import { getProject } from "../../manager";

export default defineEventHandler(async (event) => {
  return await getProject(event.context.params?.name!);
});
