<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const { page } = useData();
const isLegacy = computed(() => page.value.relativePath.startsWith("v1/"));
</script>

<template>
  <div v-if="isLegacy" class="legacy-notice custom-block warning">
    <p class="custom-block-title">这是 vuEPG 1.x 的文档</p>
    <p>
      1.x 已停止维护，仅保留文档供仍在使用的项目查阅。新项目请使用
      <a :href="withBase('/guide/introduction')">2.x</a>，已有项目可参考
      <a :href="withBase('/migration/v1')">从 1.x 升级</a>。
    </p>
  </div>
</template>

<style scoped>
.legacy-notice {
  margin-bottom: 24px;
}
</style>
