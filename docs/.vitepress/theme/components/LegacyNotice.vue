<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { useDocsText } from "../composables/use-docs-text";

const { page, lang } = useData();
const { text } = useDocsText();
const isLegacy = computed(() => /(?:^|\/)v1\//.test(page.value.relativePath));
const prefix = computed(() => (lang.value === "en" ? "/en" : ""));
</script>

<template>
  <div v-if="isLegacy" class="legacy-notice custom-block warning">
    <p class="custom-block-title">{{ text("使用建议", "Version notice") }}</p>
    <p>
      {{
        text(
          "1.x 已停止维护，仅保留文档供仍在使用的项目查阅。新项目请使用",
          "1.x is no longer maintained; these docs remain for existing applications. New projects should use",
        )
      }}
      <a :href="withBase(`${prefix}/guide/introduction`)">2.x</a
      >{{ text("，已有项目可参考", ". Existing projects can follow") }}
      <a :href="withBase(`${prefix}/migration/v1`)">{{ text("从 1.x 升级", "Upgrade from 1.x") }}</a
      >{{ text("。", ".") }}
    </p>
  </div>
</template>

<style scoped>
.legacy-notice {
  margin-bottom: 24px;
}
</style>
