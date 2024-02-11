<script setup lang="ts">
const route = useRoute();

const projectName = route.params.name;

const { data: project, refresh: refreshProject } = useFetch(
  `/api/project/${projectName}`
);

const concepts = computed(() => {
  return (project.value ?? [])
    .filter((file: string) => file.startsWith("server/concepts/"))
    .map((file: string) => file.split("/")[2]);
});

const isDirectory = (file: string) => {
  return (project.value ?? []).some((f: string) => f.startsWith(file + "/"));
};
</script>

<template>
  <h1>{{ projectName }}</h1>

  <n-collapse>
    <n-collapse-item title="File Directory">
      <ul class="file-list">
        <li
          v-for="file in project"
          :key="file"
          :style="{ marginLeft: file.split('/').length - 1 + 'em' }"
          :class="{ directory: isDirectory(file) }"
        >
          {{ file.split("/").pop() }}
        </li>
      </ul>
    </n-collapse-item>
  </n-collapse>
</template>

<style scoped>
.file-list {
  font-family: monospace;
  list-style: none;
  padding: 0;
  border: 2px solid #3b5bdb;
  border-radius: 0.5em;
  padding: 1em;
}
.file-list li {
  margin-top: 0.5em;
}
.file-list li::before {
  content: "📄";
  margin-right: 0.5em;
}
.file-list li.directory::before {
  content: "📁";
  margin-right: 0.5em;
}
</style>
