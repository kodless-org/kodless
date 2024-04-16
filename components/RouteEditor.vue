<script setup lang="ts">
type RouteRep = {
  name: string;
  method: string;
  endpoint: string;

  description: string;
  code: string;
};

const { route, project } = defineProps<{
  project: string;
  route: RouteRep;
}>();

const emit = defineEmits(["refresh"]);

const pending = ref(false);
const deleteRoute = async () => {
  pending.value = true;
  await useFetch(`/api/projects/${project}/routes/${route.name}/`, {
    method: "DELETE",
  });
  pending.value = false;
  emit("refresh");
}
</script>

<template>
  <n-button type="error" round @click="deleteRoute" :loading="pending">Delete</n-button>
  <div>
    <n-code :code="route.code" language="typescript" show-line-numbers />
  </div>
</template>

<style scoped>
button {
  margin-bottom: 16px;
}
div {
  min-width: fit-content;
  background-color: #f1f3f5;
}
</style>