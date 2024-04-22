<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const emit = defineEmits(["refresh"]);

const prompt = ref("");
const pending = ref(false);
// TODO: use pending from useFetch later
const createRoute = async (prompt: string) => {
  fetchy(`/api/projects/${project}/routes/`, {
    method: "POST",
    body: {
      prompt,
    },
  });
  emit("refresh");
};

const handleCreateRoute = async () => {
  pending.value = true;
  await createRoute(prompt.value);
  pending.value = false;
  prompt.value = "";
}

const isBulk = ref(false);
const bulkInput = ref("");

const handleCreateBulk = async () => {
  pending.value = true;
  const splits = bulkInput.value.split("\n");

  const routes: { prompt: string }[] = [];

  for (let i = 0; i < splits.length; i++) {
    let prompt = splits[i].trim();
    if (!prompt) continue;
    routes.push({ prompt });
  }

  await Promise.all(routes.map(({ prompt }) => createRoute(prompt)));

  pending.value = false;
  bulkInput.value = "";
}

</script>

<template>
  <label>
    <input type="checkbox" v-model="isBulk" /> Bulk create
  </label>
  <n-form v-if="!isBulk">
    <n-form-item label="Route description">
      <n-input v-model:value="prompt" type="textarea" />
    </n-form-item>
    <n-button @click="handleCreateRoute" :loading="pending">Create</n-button>
  </n-form>
  <n-form v-else>
    <n-form-item label="One route description per line.">
      <n-input v-model:value="bulkInput" type="textarea" />
    </n-form-item>
    <n-button @click="handleCreateBulk" :loading="pending">Create</n-button>
  </n-form>
</template>
