<script setup lang="ts">
const route = useRoute();

const projectName = route.params.name as string;

const { data: files, refresh: refreshProject } = useFetch(
  `/api/projects/${projectName}/files`
);

const dependenciesExist = computed(() => files.value?.includes("node_modules") || false);

const concepts = computed(() => {
  return (files.value ?? [])
    .filter((file: string) => file.startsWith("server/concepts/"))
    .map((file: string) => file.split("/")[2]);
});
</script>

<template>
  <h1>Project: {{ projectName }}</h1>

  <DependencyManager :dependenciesExist="dependenciesExist" :projectName="projectName" @installed="refreshProject"/>

  <n-collapse>
    <n-collapse-item title="File Directory">
      <FileTree v-if="files" :files="files" />
      <p v-else>Loading...</p>
    </n-collapse-item>
  </n-collapse>

  <h2>Concepts</h2>
  <ul class="concepts-list">
    <li v-for="concept in concepts" :key="concept">
      <n-collapse>
        <n-collapse-item :title="concept">
          <ConceptEditor :project="projectName" :concept="concept" />
        </n-collapse-item>
      </n-collapse>
    </li>
  </ul>
</template>

<style scoped>
.concepts-list {
  list-style: none;
  padding: 0;
}
</style>