<script setup lang="ts">

const router = useRouter();

const { dependenciesExist, projectName } = defineProps<{
  dependenciesExist: boolean;
  projectName: string;
}>();

const emit = defineEmits(["installed"]);

const {
  data: outputs,
  refresh: install,
  status: installStatus,
} = await useFetch(`/api/project/${projectName}/install`, {
  method: "POST",
  immediate: false,
});

const loadingInstall = computed(() => installStatus.value === "pending");

const installDependencies = async () => {
  await install();
  emit("installed");
};

const { refresh: uninstall, status: uninstallStatus } = await useFetch(
  `/api/project/${projectName}/uninstall`,
  {
    method: "POST",
    immediate: false,
  }
);

const loadingUninstall = computed(() => uninstallStatus.value === "pending");

const uninstallDependencies = async () => {
  await uninstall();
  emit("installed");
};

const deleteProject = async () => {
  if (confirm("Are you sure you want to delete this project?")) {
    await fetch(`/api/project/${projectName}`, { method: "DELETE" });
    router.push("/");
  }
};
</script>

<template>
  <n-alert
    v-if="!dependenciesExist && !loadingInstall"
    type="warning"
    title="Dependencies not installed"
  >
    <div>
      <code>node_modules</code> directory does not exist. They are needed to run
      your backend.
    </div>
  </n-alert>

  <n-alert v-if="loadingInstall" type="info" title="Installing dependencies">
    The dependencies are being installed. This could a minute, please wait and
    do not refresh the page.
  </n-alert>

  <div class="actions">
    <n-button
      type="info"
      round
      @click="installDependencies"
      v-if="!dependenciesExist"
      :loading="loadingInstall"
      >Install dependencies</n-button
    >
    <n-button type="warning" round @click="uninstallDependencies" :loading="loadingUninstall" v-else>Delete dependencies</n-button>
    <n-button type="error" round @click="deleteProject">Delete the project</n-button>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 1em;
  margin: 1em 0;
}
</style>
