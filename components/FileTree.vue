<script setup lang="ts">
const { files } = defineProps<{
  files: string[];
}>();

const isDirectory = (file: string) => {
  return (files ?? []).some((f: string) => f.startsWith(file + "/"));
};

const getClass = (file: string) => {
  if (file === "node_modules" || file === "dist") {
    return "packaging";
  }
  if (isDirectory(file)) {
    return "directory";
  }
  if (file.endsWith(".json") || file === ".gitignore") {
    return "config";
  }
  if (file.endsWith(".ts") || file.endsWith(".js")) {
    return "code";
  }
  return "";
}

</script>

<template>
  <ul>
    <li
      v-for="file in files"
      :key="file"
      :style="{ marginLeft: (file.split('/').length - 1) * 2 + 'em' }"
      :class="getClass(file)"
    >
      {{ file.split("/").pop() }}
    </li>
  </ul>
</template>

<style scoped>
ul {
  font-family: monospace;
  list-style: none;
  border: 2px solid #3b5bdb;
  border-radius: 0.5em;
  padding: 1em;
}
ul li {
  margin-top: 0.5em;
}
ul li::before {
  content: "📄";
  margin-right: 0.5em;
}
ul li.directory::before {
  content: "📁";
  margin-right: 0.5em;
}
ul li.packaging::before {
  content: "📦";
  margin-right: 0.5em;
}
ul li.config::before {
  content: "⚙️";
  margin-right: 0.5em;
}
ul li.code::before {
  content: "📝";
  margin-right: 0.5em;
}
</style>
