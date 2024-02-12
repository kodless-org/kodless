<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: status } = useFetch(`/api/projects/${project}/status`);
</script>

<template>
  
</template>