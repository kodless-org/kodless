<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: frontend, refresh: refreshFrontend } = useFetch(
  `/api/projects/${project}/frontend/`
);

const prompt = ref("");
const loading = ref(false);
const createFrontend = async () => {
  loading.value = true;
  await fetchy(`/api/projects/${project}/frontend/`, {
    method: "POST",
    body: { prompt: prompt.value },
  });
  loading.value = false;
  prompt.value = "";
  await refreshFrontend();
};
</script>

<template>
  <n-flex vertical :size="16">
    <n-form>
      <n-form-item label="Description">
        <n-input v-model:value="prompt" type="textarea" />
      </n-form-item>
      <n-button @click="createFrontend" :loading="loading" type="primary"
        >Create</n-button
      >
    </n-form>
    <div class="code" v-if="frontend">
      <n-code :code="frontend" language="typescript" show-line-numbers />
    </div>
  </n-flex>
</template>

<style scoped>
div.code {
  min-width: fit-content;
  background-color: #f1f3f5;
}
</style>
