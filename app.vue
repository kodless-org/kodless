<script setup lang="ts">
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('typescript', typescript)
</script>

<template>
  <n-config-provider inline-theme-disabled :hljs="hljs">
    <nav>
      <ul>
        <li>
          <RouterLink to="/" :class="{active: $route.path === '/'}">Home</RouterLink>
        </li>
      </ul>
    </nav>
    <main>
      <NuxtPage />
    </main>
  </n-config-provider>
</template>

<style scoped>
nav {
  background-color: #3b5bdb;
  color: white;
  padding: 1em;
}
nav ul {
  margin: 0;
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1em;
}
nav ul li {
  margin: 0;
}
nav ul li a {
  color: white;
  text-decoration: none;
}
nav ul li a:hover {
  text-decoration: underline;
}
nav ul li a.active {
  text-decoration: underline;
}

main {
  max-width: 40em;
  margin: 0 auto;
}
</style>