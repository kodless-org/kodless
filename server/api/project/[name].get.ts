import { getProject } from "../utils";

export default defineEventHandler(async (event) => {
  const name = event.context.params?.name;
  if (!name) {
    throw new Error("Missing project name");
  }
  const project = await getProject(name);
  return project;
});
