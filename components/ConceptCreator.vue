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
const createConcept = async (name: string, prompt: string) => {
  await fetchy(`/api/projects/${project}/concepts/`, {
    method: "POST",
    body: {
      concept: name,
      prompt: prompt,
    },
  });
  emit("refresh");
};

const handleCreateConcept = async () => {
  loading.value = true;
  await createConcept(newConcept.name, newConcept.prompt);
  loading.value = false;
  newConcept.name = "";
  newConcept.prompt = "";
}

const isBulk = ref(false);
const bulkInput = ref("");

const handleCreateBulk = async () => {
  loading.value = true;
  const splits = bulkInput.value.split("concept: ");

  const concepts: { name: string; prompt: string }[] = [];

  for (let i = 1; i < splits.length; i++) {
    let [name, ...restPrompt] = splits[i].split(".");
    const prompt = restPrompt.join(".");
    name = name.replace(/[^a-zA-Z0-9]/g, "");
    concepts.push({ name, prompt });
  }

  await Promise.all(concepts.map(({ name, prompt }) => createConcept(name, prompt)));

  loading.value = false;
  bulkInput.value = "";
}
</script>

<template>
  <label>
    <input type="checkbox" v-model="isBulk" /> Bulk create
  </label>
  <n-form v-if="!isBulk">
    <n-form-item label="Concept name">
      <n-input v-model:value="newConcept.name" />
    </n-form-item>
    <n-form-item label="Description">
      <n-input v-model:value="newConcept.prompt" type="textarea" />
    </n-form-item>
    <n-button @click="handleCreateConcept" :loading="loading" type="primary">Create</n-button>
  </n-form>
  <n-form v-else>
    <n-form-item label="Enter descriptions, separated by 'concept: <ConceptName>.' lines">
      <n-input v-model:value="bulkInput" type="textarea" />
    </n-form-item>
    <n-button @click="handleCreateBulk" :loading="loading" type="primary">Create</n-button>
  </n-form>
</template>
