import { createProject } from "~/server/project/manager";

// Create a new project
export default defineEventHandler(async (event) => {
  const { name } = await readBody(event);
  await createProject(name);
  return { message: `Project ${name} created` };
});
