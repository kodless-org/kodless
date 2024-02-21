<script setup lang="ts">
const { project, concept } = defineProps<{
  project: string;
  concept: string;
}>();

const { data: conceptData, refresh: refreshConcept } = await useFetch(
  `/api/projects/${project}/concepts/${concept}`,
  {
    method: "GET",
  }
);

const prompt = ref("");
const updatePending = ref(false);
const updateConcept = async () => {
  updatePending.value = true;
  await useFetch(
    `/api/projects/${project}/concepts/${concept}`,
    {
      method: "POST",
      body: { prompt: prompt.value },
    }
  );
  updatePending.value = false;
  refreshConcept();
};
</script>

<template>
  <n-flex vertical :size="16">
    <article>
      You can update the concept here. Currently, renaming a concept is not
      supported.
      <n-form>
        <n-form-item label="Revision prompt">
          <n-input v-model:value="prompt" type="textarea" />
        </n-form-item>
        <n-button
          @click="updateConcept"
          round
          type="primary"
          :loading="updatePending"
          >Update</n-button
        >
      </n-form>
    </article>

    <article>
      Prompt history:
      <n-code :code="conceptData?.prompt || 'No history'" word-wrap />
    </article>

    <article>
      Generated spec:
      <n-code
        language="typescript"
        :code="conceptData?.spec || 'No spec generated'"
        word-wrap
      />
    </article>

    <article>
      Source code:
      <div class="code">
        <n-code
          language="typescript"
          :code="conceptData?.code"
          show-line-numbers
        />
      </div>
    </article>
  </n-flex>
</template>

<style scoped>
div.code {
  min-width: fit-content;
  background-color: #f1f3f5;
}
</style>
