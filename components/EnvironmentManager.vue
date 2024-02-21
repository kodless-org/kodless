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

const changes = computed(() => {
  if (!environment.value) return false;
  const env: Record<string, string> = {};
  environmentDraft.value.forEach((pair) => {
    env[pair.key] = pair.value;
  });

  return (
    JSON.stringify(environment.value) !== JSON.stringify(env)
  );
});
</script>

<template>
  <n-flex vertical :size=16>
    <n-dynamic-input
      v-model:value="environmentDraft"
      preset="pair"
      key-placeholder="Environment Variable Name"
      value-placeholder="Value"
    />
    <n-flex justify="end">
      <n-button round type="warning" :ghost="!changes" @click="refreshEnvironment" :disabled="!changes"> Reset </n-button>
      <n-button round type="info" :ghost="!changes" @click="saveEnvironment" :disabled="!changes"> Save </n-button>
    </n-flex>
  </n-flex>
</template>