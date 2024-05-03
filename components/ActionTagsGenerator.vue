<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: actionTags, refresh: refreshActionTags } = useFetch(
  `/api/projects/${project}/actionTags/`
);

const prompt = ref("");
const loading = ref(false);
</script>

<template>
  <div class="code" v-if="actionTags">
    <n-code :code="actionTags" language="typescript" show-line-numbers />
  </div>
</template>

<style scoped>
div.code {
  min-width: fit-content;
  background-color: #f1f3f5;
}
</style>
