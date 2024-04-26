<script setup lang="ts">
const { project } = defineProps<{
  project: string;
}>();
const emit = defineEmits(["refresh"]);

const { data: conceptStore } = await useFetch("/api/store/");

const options = computed(() => {
  return conceptStore.value?.map((concept) => {
    return {
      label: concept.name,
      value: concept.name,
    };
  });
});

const selected = ref(null);

const handleImport = async () => {
  if (!selected.value) {
    return;
  }

  await fetchy(`/api/store/import`, {
    method: "POST",
    body: { project, concept: selected.value },
  });

  emit("refresh");
};
</script>

<template>
  <n-flex :size="8">
    <n-select :options v-model:value="selected"/>
    <n-button @click="handleImport" type="success" round>Import</n-button>
  </n-flex>
</template>
