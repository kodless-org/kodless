import { getProjects } from "~/server/project/manager";

// Get all projects
export default defineEventHandler(async () => {
  return await getProjects();
});
