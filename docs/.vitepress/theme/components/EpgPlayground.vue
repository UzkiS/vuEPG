<script setup lang="ts">
import { ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";
import { useDemo } from "../composables/use-demo";

const epg = useVuEPG();

const tabs = ["推荐", "电影", "剧集", "综艺"];
const menu = ["继续观看", "我的收藏", "观看历史", "设置"];
const cards = [
  { title: "星际穿越", hue: 330 },
  { title: "流浪地球", hue: 210 },
  { title: "海上钢琴师", hue: 30 },
  { title: "千与千寻", hue: 160 },
  { title: "疯狂动物城", hue: 270 },
  { title: "盗梦空间", hue: 190 },
];

const stage = ref<HTMLElement | null>(null);
const { active, activate } = useDemo(stage);
const current = ref("—");
const logs = ref<string[]>([]);

const log = (text: string): void => {
  logs.value = [text, ...logs.value].slice(0, 6);
};

const labelOf = (el: HTMLElement): string => el.dataset["label"] ?? el.textContent.trim();

const onFocus = (event: EPGEvent<"epg-focus">): void => {
  current.value = labelOf(event.detail.item.el);
  log(`epg-focus · ${current.value}`);
};
const onEnter = (event: EPGEvent<"epg-enter">): void => {
  log(`epg-enter · ${labelOf(event.detail.group.el)}`);
};
const onLeave = (event: EPGEvent<"epg-leave">): void => {
  log(`epg-leave · ${labelOf(event.detail.group.el)}`);
};
const onClick = (event: MouseEvent): void => {
  if (event.currentTarget instanceof HTMLElement) {
    activate();
    epg.move(event.currentTarget);
    log(`click     · ${labelOf(event.currentTarget)}`);
  }
};

const press = (direction: "up" | "down" | "left" | "right"): void => {
  activate();
  epg.navigate(direction);
};
const confirm = (): void => {
  epg.getCurrentItem()?.el.click();
};
</script>

<template>
  <div class="playground">
    <!-- 外层分组拦截所有方向，焦点不会离开演示区域 -->
    <div
      ref="stage"
      v-epg-group
      class="stage"
      :class="{ active }"
      @click="activate"
      @epg-up.prevent
      @epg-down.prevent
      @epg-left.prevent
      @epg-right.prevent
    >
      <header v-epg-group class="tabs" data-label="顶栏" @epg-enter="onEnter" @epg-leave="onLeave">
        <button
          v-for="tab in tabs"
          :key="tab"
          v-epg-item
          class="tile tab"
          type="button"
          @epg-focus="onFocus"
          @click.stop="onClick"
        >
          {{ tab }}
        </button>
      </header>

      <div class="body">
        <aside v-epg-group class="menu" data-label="菜单" @epg-enter="onEnter" @epg-leave="onLeave">
          <button
            v-for="item in menu"
            :key="item"
            v-epg-item
            class="tile menu-item"
            type="button"
            @epg-focus="onFocus"
            @click.stop="onClick"
          >
            {{ item }}
          </button>
        </aside>

        <main
          v-epg-group="{ default: true }"
          class="grid"
          data-label="内容"
          @epg-enter="onEnter"
          @epg-leave="onLeave"
        >
          <button
            v-for="(card, index) in cards"
            :key="card.title"
            v-epg-item="{ default: index === 0 }"
            class="tile card"
            type="button"
            :data-entry="index === 0 ? '' : undefined"
            :style="{ '--hue': card.hue }"
            @epg-focus="onFocus"
            @click.stop="onClick"
          >
            {{ card.title }}
          </button>
        </main>
      </div>

      <div v-if="!active" class="overlay">
        <strong>点击激活演示</strong>
        <span>方向键移动 · Enter 确定 · Esc / Backspace 退出</span>
      </div>
    </div>

    <div class="panel">
      <div class="status">
        <span class="badge" :class="{ on: active }">{{ active ? "已激活" : "未激活" }}</span>
        <span
          >当前焦点：<b>{{ current }}</b></span
        >
      </div>
      <div class="dpad" aria-label="虚拟遥控器">
        <button type="button" class="up" aria-label="上" @click.stop="press('up')">▲</button>
        <button type="button" class="left" aria-label="左" @click.stop="press('left')">◀</button>
        <button type="button" class="ok" aria-label="确定" @click.stop="confirm">OK</button>
        <button type="button" class="right" aria-label="右" @click.stop="press('right')">▶</button>
        <button type="button" class="down" aria-label="下" @click.stop="press('down')">▼</button>
      </div>
      <ol class="log">
        <li v-for="(entry, index) in logs" :key="`${String(index)}-${entry}`">{{ entry }}</li>
        <li v-if="logs.length === 0" class="empty">事件日志会显示在这里</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.playground {
  display: grid;
  min-width: 0;
  gap: 16px;
  margin: 24px 0;
}

.stage {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 16px;
  padding: 20px;
  aspect-ratio: 16 / 9;
  min-width: 0;
  min-height: 0;
  border-radius: 12px;
  background: radial-gradient(circle at 20% 0%, #3b0d2a, #0f0f1a 70%);
  color: #fff;
  overflow: hidden;
  cursor: pointer;
}

.tabs {
  display: flex;
  min-width: 0;
  gap: 12px;
}

.body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
  gap: 16px;
  min-width: 0;
  min-height: 0;
}

.menu {
  display: grid;
  align-content: start;
  gap: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.tile {
  min-width: 0;
  border: 0;
  border-radius: 8px;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.tab {
  padding: 6px 16px;
  background: transparent;
  opacity: 0.7;
}

.menu-item {
  padding: 10px 12px;
  text-align: left;
  background: rgba(255, 255, 255, 0.06);
}

.card {
  display: flex;
  align-items: flex-end;
  padding: 10px;
  font-weight: 600;
  overflow-wrap: anywhere;
  background: linear-gradient(160deg, hsl(var(--hue) 70% 55%), hsl(var(--hue) 60% 25%));
}

.tile.vuepg-focus {
  opacity: 1;
  transform: scale(1.06);
  box-shadow:
    0 0 0 3px #fff,
    0 8px 24px rgba(0, 0, 0, 0.45);
}

.tab.vuepg-focus {
  background: rgba(255, 255, 255, 0.18);
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 6px;
  text-align: center;
  background: rgba(10, 10, 20, 0.6);
  backdrop-filter: blur(2px);
}

.overlay strong {
  font-size: 20px;
}

.overlay span {
  font-size: 13px;
  opacity: 0.8;
}

.panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "status dpad"
    "log dpad";
  gap: 12px 24px;
  align-items: start;
  min-width: 0;
}

.status {
  grid-area: status;
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
}

.badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: var(--vp-c-default-soft);
}

.badge.on {
  color: #fff;
  background: var(--vp-c-brand-1);
}

.log {
  grid-area: log;
  margin: 0;
  padding: 12px 16px;
  min-height: 150px;
  min-width: 0;
  overflow-wrap: anywhere;
  list-style: none;
  border-radius: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  background: var(--vp-c-bg-soft);
}

.log li {
  margin: 0;
}

.log .empty {
  color: var(--vp-c-text-3);
}

.dpad {
  grid-area: dpad;
  display: grid;
  grid-template-areas:
    ". up ."
    "left ok right"
    ". down .";
  gap: 6px;
}

.dpad button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--vp-c-default-soft);
  cursor: pointer;
}

.dpad button:hover {
  background: var(--vp-c-brand-soft);
}

.dpad .up {
  grid-area: up;
}
.dpad .down {
  grid-area: down;
}
.dpad .left {
  grid-area: left;
}
.dpad .right {
  grid-area: right;
}
.dpad .ok {
  grid-area: ok;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .stage {
    aspect-ratio: auto;
    grid-template-rows: auto auto;
    padding: 12px;
    gap: 12px;
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
  }

  .tab {
    padding: 8px 2px;
    font-size: 12px;
  }

  .body {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .menu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .menu-item {
    padding: 8px;
    font-size: 12px;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .card {
    min-height: 72px;
    font-size: 12px;
  }

  .overlay {
    padding: 12px;
  }

  .panel {
    grid-template-columns: 1fr;
    grid-template-areas: "status" "dpad" "log";
  }

  .dpad {
    justify-content: center;
  }
}
</style>
