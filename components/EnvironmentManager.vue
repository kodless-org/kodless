<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: environment, refresh: refreshEnvironment } = useFetch(
  `/api/projects/${project}/environment`
);

const environmentDraft = ref<{ key: string; value: string }[]>([]);

watch(environment, () => {
  if (!environment.value) return;
  console.log(environment.value);
  environmentDraft.value = Object.entries(environment.value).map(
    ([key, value]) => ({ key, value })
  );
});

const saveEnvironment = async () => {
  const env: Record<string, string> = {};
  environmentDraft.value.forEach((pair) => {
    env[pair.key] = pair.value;
  });

  await useFetch(`/api/projects/${project}/environment`, {
    method: "PUT",
    body: { env },
  });

  refreshEnvironment();
};
</script>

<template>
  <n-dynamic-input
    v-model:value="environmentDraft"
    preset="pair"
    key-placeholder="Environment Variable Name"
    value-placeholder="Value"
  />
  <n-button round type="primary" @click="saveEnvironment"> Save </n-button>
</template>
