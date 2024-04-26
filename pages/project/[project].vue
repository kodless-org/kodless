<script setup lang="ts">
const route = useRoute();
const projectName = route.params.project as string;
useHead({
  title: projectName,
  meta: [
    {
      content: `Manage the ${projectName} project.`,
    },
  ],
});

const { data: files, refresh: refreshProject } = useFetch(
  `/api/projects/${projectName}/files/`
);

const dependenciesExist = computed(
  () => files.value?.includes("node_modules") || false
);

const concepts = computed(() => {
  return (files.value ?? [])
    .filter((file: string) => file.startsWith("server/concepts/"))
    .map((file: string) => file.split("/")[2]);
});

const { data: routes, refresh: refreshRoutes } = useFetch(`/api/projects/${projectName}/routes/`);
</script>

<template>
  <h1>Project: {{ projectName }}</h1>
  <n-flex vertical :size="16">
    <DependencyManager
      :dependenciesExist="dependenciesExist"
      :projectName="projectName"
      @installed="refreshProject"
    />

    <ProjectStatus :project="projectName" />

    <n-collapse>
      <n-collapse-item title="Environment Variables">
        <EnvironmentManager :project="projectName" />
      </n-collapse-item>
      <n-collapse-item title="File Directory">
        <FileTree v-if="files" :files="files" />
        <p v-else>Loading...</p>
      </n-collapse-item>
    </n-collapse>

    <h2>Concepts</h2>
    <n-collapse>
      <n-collapse-item title="Create a new concept">
        <template #arrow> ⚙️ </template>
        <ConceptCreator :project="projectName" @refresh="refreshProject" />
      </n-collapse-item>

      <n-collapse-item title="Import a concept from the store">
        <template #arrow> 📥 </template>
        <ConceptImporter :project="projectName" @refresh="refreshProject" />
      </n-collapse-item>
    </n-collapse>

    <ul class="list">
      <li v-for="concept in concepts" :key="concept">
        <n-collapse>
          <n-collapse-item :title="concept">
            <template #arrow> 💡 </template>
            <ConceptEditor :project="projectName" :concept="concept" @refresh="refreshProject" />
          </n-collapse-item>
        </n-collapse>
      </li>
    </ul>

    <h2>App Definition</h2>
    <n-collapse>
      <n-collapse-item title="Edit the app definition">
        <template #arrow> ⚙️ </template>
        <AppDefinitionEditor :project="projectName" />
      </n-collapse-item>
    </n-collapse>

    <h2>Syncs/Routes</h2>
    <n-collapse>
      <n-collapse-item title="Create a new route">
        <template #arrow> ⚙️ </template>
        <RouteCreator :project="projectName" @refresh="refreshRoutes" />
      </n-collapse-item>
    </n-collapse>
    <ul class="list">
      <li v-for="route in routes" :key="route.name">
        <n-collapse>
          <n-collapse-item :title="`${route.name} (${route.description})`">
            <RouteEditor :project="projectName" :route="route" @refresh="refreshRoutes" />
          </n-collapse-item>
        </n-collapse>
      </li>
    </ul>
  </n-flex>
</template>

<style scoped>
h2 {
  margin: 0;
}

ul.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
