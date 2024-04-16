<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: appDefinition, refresh: refreshAppDefinition } = useFetch(`/api/projects/${project}/app/`);

const prompt = ref("");
const loading = ref(false);
const updateAppDefinition = async () => {
  loading.value = true;
  await useFetch(`/api/projects/${project}/app/`, {
    method: "POST",
    body: { prompt: prompt.value },
  });
  loading.value = false;
  prompt.value = "";
  await refreshAppDefinition();
};
</script>

<template>
  <n-flex vertical :size="16">
    <n-form>
      <n-form-item label="Describe updates to the app definition">
        <n-input v-model:value="prompt" type="textarea" />
      </n-form-item>
      <n-button @click="updateAppDefinition" round type="primary" :loading="loading">Update</n-button>
    </n-form>
    <div class="code" v-if="appDefinition">
      <n-code :code="appDefinition" language="typescript" show-line-numbers />
    </div>
  </n-flex>
</template>

<style scoped>
div.code {
  min-width: fit-content;
  background-color: #f1f3f5;
}
</style>
