import { getProjects } from "./utils";

export default defineEventHandler(async (event) => {
  const projects = await getProjects();
  return projects;
});
