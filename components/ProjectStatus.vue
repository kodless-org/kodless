<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();

const { data: statusWrap, refresh: refreshStatus } = useFetch(
  `/api/projects/${project}/status`
);

const status = computed(() => statusWrap.value?.status);
const logs = ref<string>("");

const runProject = async () => {
  await useFetch(`/api/projects/${project}/run`, {
    method: "POST",
  });
  logs.value = "";
  refreshStatus();
};

const stopProject = async () => {
  await useFetch(`/api/projects/${project}/stop`, {
    method: "POST",
  });
  refreshStatus();
};

let interval: NodeJS.Timeout;
watch(status, (newStatus) => {
  if (newStatus === "running") {
    interval = setInterval(refreshStatus, 1000);
  } else {
    clearInterval(interval);
  }
});

onMounted(() => {
  const ws = new WebSocket(`ws://localhost:8080/`);
  ws.onmessage = (event) => {
    const { project: incomingProject, data } = JSON.parse(event.data);
    if (project === incomingProject) {
      logs.value += data;
    }
  };
});
</script>

<template>
  <n-flex vertical :size="16">
    <n-alert
      v-if="status"
      :type="status === 'running' ? 'success' : 'warning'"
      title="Project Status"
    >
      Project is {{ status }}.
    </n-alert>

    <n-button
      v-if="status === 'running'"
      round
      type="warning"
      @click="stopProject"
    >
      Stop running
    </n-button>
    <n-button v-else round type="primary" @click="runProject">
      Start running
    </n-button>

    <div class="logs" v-if="logs">
      <n-code :code="logs" word-wrap />
    </div>
  </n-flex>
</template>

<style scoped>
.logs {
  color: white;
  background-color: #333;
  padding: 1em;

  max-height: 30em;
  overflow-y: auto;
}
</style>
