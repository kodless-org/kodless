<script setup lang="ts">
useHead({
  title: "Kodless",
  meta: [
    {
      content:
        "Kodless is a platform for building web applications without writing code.",
    },
  ],
});

let { data: projectsAll, refresh: refreshProjects } = await useFetch(
  "/api/projects/"
);

const projects = computed(() =>
  projectsAll.value?.filter((project) => project !== "template")
);

const projectName = ref("");

const createProject = async () => {
  await fetchy("/api/projects/", {
    method: "POST",
    body: { name: projectName.value },
  });
  projectName.value = "";
  refreshProjects();
};

const { data: conceptStore } = await useFetch("/api/store/");
</script>

<template>
  <h1>Welcome to Kodless</h1>

  <n-collapse>
    <n-collapse-item title="Create a new project">
      <n-form class="project-form">
        <n-form-item label="Project name">
          <n-input
            v-model:value="projectName"
            type="text"
            placeholder="Project name"
          />
        </n-form-item>
        <n-form-item>
          <n-button @click="createProject">Create</n-button>
        </n-form-item>
      </n-form>
    </n-collapse-item>
  </n-collapse>

  <div v-if="projects">
    <h2>Projects</h2>
    <ul>
      <li v-for="project in projects" :key="project">
        <RouterLink :to="`/project/${project}`">{{ project }}</RouterLink>
      </li>
    </ul>
    <p v-if="projects.length === 0">No projects yet</p>
  </div>

  <div>
    <h2>Concept Store</h2>
    <n-collapse>
      <n-collapse-item
        :title="concept.name"
        v-for="concept in conceptStore"
        :key="concept.name"
      >
        <template #header-extra v-if="concept.meta.purpose">{{
          concept.meta.purpose
        }}</template>
        <article>
          Prompt:
          <n-code :code="concept.meta.prompt || 'No prompt'" word-wrap />
        </article>
        <article>
          Spec:
          <n-code
            language="typescript"
            :code="concept.meta.spec || 'No spec'"
            show-line-numbers
          />
        </article>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<style scoped>
.project-form {
  display: flex;
  gap: 1em;
  max-width: 20em;
}
</style>
