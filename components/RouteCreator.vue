<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const emit = defineEmits(["refresh"]);

const prompt = ref("");
const pending = ref(false);
const createRoute = async () => {
  pending.value = true;
  await useFetch(`/api/projects/${project}/routes/`, {
    method: "POST",
    body: {
      prompt: prompt.value,
    },
  });
  pending.value = false;
  prompt.value = "";
  emit("refresh");
};
</script>

<template>
  <n-form>
    <n-form-item label="Route description">
      <n-input v-model:value="prompt" type="textarea" />
    </n-form-item>
    <n-button @click="createRoute" :loading="pending">Create</n-button>
  </n-form>
</template>
