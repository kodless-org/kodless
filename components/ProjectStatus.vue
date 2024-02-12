<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: statusWrap, refresh: refreshStatus } = useFetch(`/api/projects/${project}/status`);

const status = computed(() => statusWrap.value?.status);

const runProject = async () => {
  await useFetch(`/api/projects/${project}/run`, {
    method: "POST",
  });
  refreshStatus();
};

const stopProject = async () => {
  await useFetch(`/api/projects/${project}/stop`, {
    method: "POST",
  });
  refreshStatus();
};

</script>

<template>
  <n-alert
    v-if="status"
    :type="status === 'running' ? 'success' : 'warning'"
    title="Project Status"
  >
    Project is {{ status }}.
  </n-alert>

  <n-button v-if="status === 'running'" round type="warning" @click="stopProject">
    Stop running
  </n-button>
  <n-button v-else round type="primary" @click="runProject">
    Start running
  </n-button>
</template>
