<script setup lang="ts">
import { useDocsText } from "../composables/use-docs-text";
import { computed, ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";
import { useDemo } from "../composables/use-demo";

const { text } = useDocsText();
const epg = useVuEPG();

const tabs = computed(() => [
  text("推荐", "Featured"),
  text("电影", "Movies"),
  text("剧集", "Series"),
  text("综艺", "Shows"),
]);
const menu = computed(() => [
  text("继续观看", "Continue watching"),
  text("我的收藏", "Favorites"),
  text("观看历史", "History"),
  text("设置", "Settings"),
]);
const cards = computed(() => [
  { title: text("星际穿越", "Interstellar") },
  { title: text("流浪地球", "The Wandering Earth") },
  { title: text("海上钢琴师", "The Legend of 1900") },
  { title: text("千与千寻", "Spirited Away") },
  { title: text("疯狂动物城", "Zootopia") },
  { title: text("盗梦空间", "Inception") },
]);

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
  <div class="playground vuepg-demo">
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
      <header
        v-epg-group
        class="tabs"
        :data-label="text('顶栏', 'Tabs')"
        @epg-enter="onEnter"
        @epg-leave="onLeave"
      >
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
        <aside
          v-epg-group
          class="menu"
          :data-label="text('菜单', 'Menu')"
          @epg-enter="onEnter"
          @epg-leave="onLeave"
        >
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
          :data-label="text('内容', 'Content')"
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
            :class="`card-tone-${index % 3}`"
            :data-label="card.title"
            @epg-focus="onFocus"
            @click.stop="onClick"
          >
            <span class="card-number" aria-hidden="true">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <strong>{{ card.title }}</strong>
          </button>
        </main>
      </div>

      <div v-if="!active" class="overlay">
        <strong>{{ text("点击激活演示", "Activate demo") }}</strong>
        <span>{{
          text(
            "方向键移动 · Enter 确定 · Esc / Backspace 退出",
            "Arrow keys move · Enter confirms · Esc / Backspace exits",
          )
        }}</span>
      </div>
    </div>

    <div class="panel">
      <div class="status">
        <span class="badge" :class="{ on: active }">{{
          active ? text("已激活", "Active") : text("未激活", "Inactive")
        }}</span>
        <span
          >{{ text("当前焦点：", "Current focus: ") }}<b>{{ current }}</b></span
        >
      </div>
      <div class="dpad" :aria-label="text('虚拟遥控器', 'Virtual controls')">
        <button type="button" class="up" :aria-label="text('上', 'Up')" @click.stop="press('up')">
          ▲
        </button>
        <button
          type="button"
          class="left"
          :aria-label="text('左', 'Left')"
          @click.stop="press('left')"
        >
          ◀
        </button>
        <button
          type="button"
          class="ok"
          :aria-label="text('确定', 'Confirm')"
          @click.stop="confirm"
        >
          OK
        </button>
        <button
          type="button"
          class="right"
          :aria-label="text('右', 'Right')"
          @click.stop="press('right')"
        >
          ▶
        </button>
        <button
          type="button"
          class="down"
          :aria-label="text('下', 'Down')"
          @click.stop="press('down')"
        >
          ▼
        </button>
      </div>
      <ol class="log">
        <li v-for="(entry, index) in logs" :key="`${String(index)}-${entry}`">{{ entry }}</li>
        <li v-if="logs.length === 0" class="empty">
          {{ text("事件日志会显示在这里", "Events appear here") }}
        </li>
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
  gap: 20px;
  padding: 24px;
  aspect-ratio: 16 / 9;
  min-width: 0;
  min-height: 0;
  border: 1px solid var(--demo-border);
  border-radius: 22px;
  background: var(--demo-canvas);
  overflow: hidden;
  cursor: pointer;
}

.tabs {
  display: flex;
  min-width: 0;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--demo-border);
}

.body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
  gap: 20px;
  min-width: 0;
  min-height: 0;
}

.menu {
  display: grid;
  align-content: start;
  gap: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;
  min-height: 0;
}

.tile {
  min-width: 0;
  border: 0;
  border-radius: 12px;
  color: var(--demo-text);
  font: inherit;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.tile:focus {
  outline: none;
}

.tile:focus-visible,
.dpad button:focus-visible {
  outline: 2px solid var(--demo-primary);
  outline-offset: 3px;
}

.tab {
  padding: 6px 12px;
  background: transparent;
  font-weight: 600;
}

.menu-item {
  padding: 12px;
  text-align: left;
  background: var(--demo-surface);
}

.card {
  border: 1px solid var(--demo-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px;
  border-radius: 16px;
  overflow-wrap: anywhere;
  text-align: left;
}

.card-tone-0 {
  background: var(--demo-tone-0);
}
.card-tone-1 {
  background: var(--demo-tone-1);
}
.card-tone-2 {
  background: var(--demo-tone-2);
}

.card-number {
  font-size: 13px;
  opacity: 0.65;
}

.card strong {
  font-size: 14px;
  line-height: 1.4;
}

.tile.vuepg-focus {
  background: var(--demo-primary-soft);
  outline: 3px solid var(--demo-focus);
  outline-offset: 3px;
  box-shadow: 0 0 0 7px var(--demo-focus-soft);
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
  background: var(--demo-overlay);
}

.overlay strong {
  justify-self: center;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 18px;
  color: var(--demo-on-primary);
  background: var(--demo-primary);
}

.overlay span {
  font-size: 12px;
  color: var(--demo-text-muted);
}

.panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "status dpad"
    "log dpad";
  gap: 14px 24px;
  align-items: start;
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  background: var(--demo-canvas);
}

.status {
  grid-area: status;
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
  font-size: 13px;
}

.badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: var(--demo-muted);
}

.badge.on {
  color: var(--demo-on-primary);
  background: var(--demo-primary);
}

.log {
  grid-area: log;
  margin: 0;
  padding: 12px 14px;
  min-height: 150px;
  min-width: 0;
  overflow-wrap: anywhere;
  list-style: none;
  border: 1px solid var(--demo-border);
  border-radius: 12px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  background: var(--demo-surface);
}

.log li {
  margin: 0;
}
.log .empty {
  color: var(--demo-text-muted);
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
  width: 42px;
  height: 42px;
  border: 1px solid var(--demo-border);
  border-radius: 10px;
  background: var(--demo-surface);
  cursor: pointer;
}

.dpad button:hover {
  background: var(--demo-primary-soft);
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
  color: var(--demo-on-primary);
  background: var(--demo-primary);
}
.dpad .ok:hover {
  background: var(--demo-primary);
}

@media (max-width: 640px) {
  .stage {
    aspect-ratio: auto;
    grid-template-rows: auto auto;
    padding: 16px;
    gap: 14px;
  }
  .tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    padding-bottom: 12px;
  }
  .tab {
    padding: 6px 2px;
    font-size: 12px;
  }
  .body {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
  .menu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .menu-item {
    padding: 10px;
    font-size: 12px;
  }
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .card {
    min-height: 95px;
    padding: 12px;
  }
  .card strong {
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
