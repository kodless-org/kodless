import { deleteRoute } from "~/server/project/manager";

export default defineEventHandler(async (event) => {
  const { name, route } = event.context.params!;
  if (!route) {
    throw createError({
      status: 400,
      statusMessage: "Missing route",
    });
  }
  return deleteRoute(name, route);
});
