<script setup lang="ts">
const { project, concept } = defineProps<{
  project: string;
  concept: string;
}>();

const { data: conceptSrc, refresh: getConceptSrc } = await useFetch(
  `/api/project/${project}/${concept}`,
  {
    method: "GET",
  }
);
</script>

<template>
  <div>
    <n-code language="typescript" :code="conceptSrc" show-line-numbers />
  </div>
</template>

<style scoped>
div {
  width: fit-content;
  background-color: #f1f3f5;
}
</style>