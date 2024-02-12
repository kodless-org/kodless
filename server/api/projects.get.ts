import { getProjects } from "../manager";

export default defineEventHandler(async (event) => {
  return await getProjects();
});
