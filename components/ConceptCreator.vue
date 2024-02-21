<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const emit = defineEmits(["refresh"]);

const newConcept = reactive({
  name: "",
  prompt: "",
});
const loading = ref(false);
const createConcept = async () => {
  loading.value = true;
  await useFetch(`/api/projects/${project}/concepts/`, {
    method: "POST",
    body: {
      concept: newConcept.name,
      prompt: newConcept.prompt,
    },
  });
  loading.value = false;
  newConcept.name = "";
  newConcept.prompt = "";
  emit("refresh");
};
</script>

<template>
  <n-form>
    <n-form-item label="Concept name">
      <n-input v-model:value="newConcept.name" />
    </n-form-item>
    <n-form-item label="Description">
      <n-input v-model:value="newConcept.prompt" type="textarea" />
    </n-form-item>
    <n-button @click="createConcept" :loading="loading" type="primary">Create</n-button>
  </n-form>
</template>
