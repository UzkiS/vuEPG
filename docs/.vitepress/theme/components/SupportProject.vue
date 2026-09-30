<script setup lang="ts">
import { withBase } from "vitepress";
import { useDocsText } from "../composables/use-docs-text";

const { text } = useDocsText();
const methods = [
  { chinese: "微信支付", english: "WeChat Pay", image: "/support/wechat-pay.png" },
  { chinese: "支付宝", english: "Alipay", image: "/support/alipay.jpg" },
];
</script>

<template>
  <section class="support-project" :aria-label="text('支持 vuEPG', 'Support vuEPG')">
    <img
      class="blue-fish"
      :src="withBase('/support/blue-fish.webp')"
      :alt="text('吃白饭的蓝色大肥鱼', 'The big blue fish enjoying a bowl of rice')"
      width="850"
      height="850"
      loading="lazy"
    />
    <p>
      {{
        text(
          "我的蓝色大肥鱼为爱发电没饭吃了！！！如果本项目有帮到你，可以给她喂一点白饭！🐳🍚",
          "My big blue fish has been working for love alone, and now she is out of rice!!! If this project has helped you, please feed her a little rice! 🐳🍚",
        )
      }}
    </p>
    <p class="support-note">
      {{
        text(
          "点个 Star、提个建议、分享给朋友，也都是支持。",
          "A star, a suggestion or sharing the project with a friend helps too.",
        )
      }}
    </p>
    <details>
      <summary>
        {{ text("投喂入口 · 微信 / 支付宝", "Treat the author · WeChat Pay / Alipay") }}
      </summary>
      <div class="payment-methods">
        <a
          v-for="method in methods"
          :key="method.image"
          :href="withBase(method.image)"
          target="_blank"
          rel="noopener"
          class="payment-method"
        >
          <span>{{ text(method.chinese, method.english) }}</span>
          <img
            :src="withBase(method.image)"
            :alt="
              text(
                `${method.chinese}支持项目收款码`,
                `${method.english} QR code for supporting the project`,
              )
            "
            loading="lazy"
          />
          <small>{{ text("点击查看原图", "Open full-size image") }}</small>
        </a>
      </div>
    </details>
  </section>
</template>

<style scoped>
.support-project {
  margin-top: 16px;
  padding: 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}
.support-project p {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
}
.support-project .support-note {
  margin-top: 8px;
  color: var(--vp-c-text-2);
}
.blue-fish {
  width: 240px;
  max-width: 100%;
  height: auto;
  margin-bottom: 16px;
  border-radius: 12px;
}
details {
  margin-top: 16px;
}
summary {
  width: fit-content;
  max-width: 100%;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.8;
}
summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
  border-radius: 4px;
}
.payment-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}
.payment-method {
  display: flex;
  flex: 0 1 220px;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  gap: 10px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.payment-method span {
  font-size: 14px;
  font-weight: 600;
}
.payment-method img {
  width: 100%;
  height: 330px;
  object-fit: contain;
  border-radius: 10px;
  background: #fff;
}
.payment-method small {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
@media (max-width: 640px) {
  .support-project {
    padding: 16px;
  }
  .payment-methods {
    justify-content: center;
  }
}
</style>
