<script setup lang="ts">
type RouteRep = {
  name: string;
  method: string;
  endpoint: string;

  description: string;
  code: string;
};

const { route } = defineProps<{
  project: string;
  route: RouteRep;
}>();



</script>

<template>
  <n-button type="error" round>Delete</n-button>
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