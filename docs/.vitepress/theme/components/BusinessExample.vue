<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const { lang } = useData();
const english = computed(() => lang.value === "en");
</script>

<template>
  <a
    class="business-example-card vuepg-demo"
    :href="withBase('/example/tv-training/')"
    target="_blank"
    rel="noopener"
  >
    <img
      :src="withBase('/example-preview.png')"
      :alt="
        english
          ? 'TV learning center: remote navigation, scrolling and dialogs'
          : '遥控学习中心：遥控器导航、滚动和弹窗示例'
      "
      width="1280"
      height="720"
    />
    <span>{{ english ? "Open the complete example" : "打开完整示例" }} <b>↗</b></span>
  </a>
</template>

<style scoped>
.business-example-card {
  display: block;
  border: 1px solid var(--demo-border);
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
}
.business-example-card img {
  width: 100%;
  height: auto;
}
.business-example-card span {
  display: flex;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--demo-canvas);
  font-weight: 600;
}
</style>
