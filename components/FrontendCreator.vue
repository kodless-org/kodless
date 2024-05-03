<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const emit = defineEmits(["refresh"]);

const newFrontend = reactive({
  prompt: "",
});

const loading = ref(false);
const createFrontend = async (prompt: string) => {
  await fetchy(`/api/projects/${project}/frontend/`, {
    method: "POST",
    body: {
      prompt: prompt,
    },
  });
  emit("refresh");
};

const handleCreateFrontend = async () => {
  loading.value = true;
  await createFrontend(newFrontend.prompt);
  loading.value = false;
  newFrontend.prompt = "";
};
</script>

<template>
  <n-form>
    <n-form-item label="Description">
      <n-input v-model:value="newFrontend.prompt" type="textarea" />
    </n-form-item>
    <n-button @click="handleCreateFrontend" :loading="loading" type="primary"
      >Create</n-button
    >
  </n-form>
</template>
