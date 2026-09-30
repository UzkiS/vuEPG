<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useVuEPG } from "vuepg";
import packageInfo from "vuepg/package.json";
import FocusDialog from "./focus-dialog.vue";
import { attachNativeBridge, dispatchNativeKey } from "./bridge";
import { lessons } from "./data";

const epg = useVuEPG();
const documentationUrl = packageInfo.homepage;
const repositoryUrl = packageInfo.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
const screen = ref<"home" | "lessons" | "player">("home");
const activeLesson = ref(1);
const rememberedLesson = ref(1);
const focusedLabel = ref("准备就绪");
const dialog = ref<"exit" | "lesson" | null>(null);
const completed = ref<number[]>([]);
const notice = ref("");
const nativeLog = ref("等待模拟原生按键");
const homeStart = ref<HTMLElement>();
const filterButton = ref<HTMLElement>();
const hideCompleted = ref(false);
const visibleLessons = computed(() =>
  lessons.filter((lesson) => !hideCompleted.value || completed.value.indexOf(lesson.id) === -1),
);
const scale = ref(1);
let detachBridge: (() => void) | undefined;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

const selected = computed(() => lessons.find((lesson) => lesson.id === activeLesson.value));
const progress = computed(() => Math.round((completed.value.length / lessons.length) * 100));
const lessonElement = (id: number): Element | null =>
  document.querySelector(`[data-testid="lesson-${String(id)}"]`);
const focusLesson = (): boolean =>
  epg.move(lessonElement(rememberedLesson.value)) ||
  epg.move(lessonElement(visibleLessons.value[0]?.id ?? 0)) ||
  epg.move(filterButton.value);
const selectLesson = (id: number): void => {
  rememberedLesson.value = id;
  focusedLabel.value = `第 ${String(id)} 站 · ${lessons[id - 1]?.title ?? "探索练习"}`;
};
const showLessons = async (): Promise<void> => {
  screen.value = "lessons";
  await nextTick();
  focusLesson();
};
const showHome = async (): Promise<void> => {
  screen.value = "home";
  await nextTick();
  epg.move(homeStart.value);
};
const startLesson = async (id: number): Promise<void> => {
  activeLesson.value = id;
  rememberedLesson.value = id;
  screen.value = "player";
  await nextTick();
  epg.move(document.getElementById("complete-lesson"));
};
const cycle = (id: number, delta: number): void => {
  const list = visibleLessons.value;
  const index = list.findIndex((lesson) => lesson.id === id);
  const next = list[(index + delta + list.length) % list.length];
  if (next !== undefined) {
    epg.move(lessonElement(next.id));
  }
};
const announce = (text: string): void => {
  notice.value = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice.value = "";
  }, 3000);
};
const finishLesson = (): void => {
  if (completed.value.indexOf(activeLesson.value) === -1) {
    completed.value.push(activeLesson.value);
  }
  dialog.value = "lesson";
};
const closeDialog = (): void => {
  dialog.value = null;
};
const confirmDialog = async (): Promise<void> => {
  const kind = dialog.value;
  closeDialog();
  if (kind === "lesson") {
    await showLessons();
  } else {
    announce("模拟宿主退出：示例继续保留在当前页面");
  }
};
const openExit = (): void => {
  dialog.value = "exit";
};

epg.onBack(() => {
  if (screen.value === "player") {
    void showLessons();
  } else if (screen.value === "lessons") {
    void showHome();
  } else {
    openExit();
  }
});

const updateScale = (): void => {
  scale.value = Math.max(
    0.15,
    Math.min(window.innerWidth / 1280, (window.innerHeight - 150) / 720, 1.35),
  );
};
const mockNative = (code: number): void => {
  window.dispatchEvent(new CustomEvent("vuepg-native-key", { detail: { keyCode: code } }));
};
const activate = (): void => {
  dispatchNativeKey(23);
};
onMounted(() => {
  updateScale();
  window.addEventListener("resize", updateScale);
  detachBridge = attachNativeBridge((keyCode) => {
    nativeLog.value = `Android keyCode ${String(keyCode)} → 已交给 vuEPG`;
  });
  epg.move(homeStart.value);
});
onUnmounted(() => {
  detachBridge?.();
  clearTimeout(noticeTimer);
  window.removeEventListener("resize", updateScale);
});
</script>

<template>
  <div class="example-shell">
    <header class="example-topbar">
      <a class="example-brand" :href="documentationUrl" target="_blank" rel="noopener"
        >vuEPG <span>业务示例</span></a
      >
      <span class="example-key-hint">方向键移动 · Enter 确定 · Esc 返回</span>
      <nav class="example-project-links" aria-label="项目链接">
        <a :href="documentationUrl" target="_blank" rel="noopener" data-testid="docs-link"
          >文档 ↗</a
        >
        <a :href="repositoryUrl" target="_blank" rel="noopener" data-testid="github-link"
          >GitHub ↗</a
        >
      </nav>
    </header>
    <div class="stage-wrapper" :style="{ width: 1280 * scale + 'px', height: 720 * scale + 'px' }">
      <div class="tv-stage" :style="{ transform: 'scale(' + scale + ')' }">
        <header v-epg-group class="tv-header">
          <div class="brand-mark">游</div>
          <div class="brand-name">遥控学习中心<small>每一步，都有新发现</small></div>
          <div class="tv-header-actions">
            <button v-epg-item class="quiet-button" data-testid="home-nav" @click="showHome">
              首页
            </button>
            <button v-epg-item class="quiet-button" data-testid="lessons-nav" @click="showLessons">
              探索地图
            </button>
            <button v-epg-item class="quiet-button" data-testid="exit-open" @click="openExit">
              退出
            </button>
          </div>
        </header>

        <main v-if="screen === 'home'" v-epg-group class="home-screen">
          <div class="hero-copy">
            <span class="eyebrow">今天，也向前一步</span>
            <h1>把好奇心，<br />变成一场旅行。</h1>
            <p>沿着十二个探索站，观察、思考、发现。<br />拿起遥控器，选择你的下一站。</p>
            <button
              ref="homeStart"
              v-epg-item
              class="button-primary hero-start"
              data-testid="start"
              @click="showLessons"
            >
              开始探索 <span>→</span>
            </button>
            <div class="hero-progress">
              <span>已点亮 {{ completed.length }} / {{ lessons.length }} 个站点</span>
              <div><i :style="{ width: progress + '%' }"></i></div>
            </div>
          </div>
          <div class="hero-art" aria-hidden="true">
            <div class="orbit orbit-one"></div>
            <div class="orbit orbit-two"></div>
            <span class="art-star star-one">✦</span><span class="art-star star-two">✦</span>
            <div class="art-card card-back"><span>02</span><i>○</i></div>
            <div class="art-card card-front">
              <span>01</span><i>△</i><small>一起发现新可能</small>
            </div>
            <div class="art-bubble">下一站，发现！</div>
          </div>
          <div class="home-bottom">
            <span>真实业务交互 · 模拟数据</span><span>Vue 2.7 + vuEPG · 遥控器导航</span>
          </div>
        </main>

        <main v-else-if="screen === 'lessons'" v-epg-group class="lesson-screen">
          <div class="section-heading">
            <div>
              <span class="eyebrow">十二站探索之旅</span>
              <h1>选择你的下一站</h1>
            </div>
            <div class="lesson-filter">
              <p>左右循环 · 自动滚动 · 返回记忆位置</p>
              <button
                ref="filterButton"
                v-epg-item
                class="quiet-button"
                data-testid="filter-completed"
                @click="hideCompleted = !hideCompleted"
              >
                {{ hideCompleted ? "显示全部站点" : "只看未完成" }}
              </button>
            </div>
          </div>
          <div
            v-epg-scroll="'center'"
            v-epg-group
            class="lesson-scroll"
            data-testid="lesson-scroll"
          >
            <div v-if="visibleLessons.length === 0" class="lesson-empty" data-testid="lesson-empty">
              <strong>所有站点都已点亮</strong>
              <p>选择「显示全部站点」，可以继续探索。</p>
            </div>
            <div v-else class="lesson-track">
              <button
                v-for="lesson in visibleLessons"
                :key="lesson.id"
                v-epg-item="{ default: lesson.id === rememberedLesson }"
                class="lesson-card"
                :class="'lesson-tone-' + (lesson.id % 3)"
                :data-testid="'lesson-' + lesson.id"
                @epg-focus="selectLesson(lesson.id)"
                @epg-left.prevent="cycle(lesson.id, -1)"
                @epg-right.prevent="cycle(lesson.id, 1)"
                @click="startLesson(lesson.id)"
              >
                <span class="lesson-number">{{ lesson.id < 10 ? "0" : "" }}{{ lesson.id }}</span>
                <span class="lesson-symbol">{{
                  lesson.id % 3 === 0 ? "◇" : lesson.id % 3 === 1 ? "△" : "○"
                }}</span>
                <strong>{{ lesson.title }}</strong
                ><small>{{ lesson.note }}</small>
                <span class="lesson-state">{{
                  completed.indexOf(lesson.id) === -1 ? "等待探索" : "已点亮 ✓"
                }}</span>
              </button>
            </div>
          </div>
          <footer class="lesson-footer">
            <span>{{ visibleLessons.length > 0 ? focusedLabel : "全部完成" }}</span
            ><span>按确定开始 · 按返回回到首页</span>
          </footer>
        </main>

        <main v-else v-epg-group class="player-screen">
          <span class="eyebrow">第 {{ activeLesson }} 站</span>
          <h1>{{ selected?.title }}</h1>
          <p>这是一次模拟练习。完整体验开始、完成、弹窗和返回流程。</p>
          <div class="practice-board" aria-hidden="true">
            <span>△</span><span>○</span><span>◇</span><span>？</span>
          </div>
          <div class="practice-actions">
            <button
              id="complete-lesson"
              v-epg-item
              class="button-primary"
              data-testid="complete"
              @click="finishLesson"
            >
              点亮这一站</button
            ><button v-epg-item @click="showLessons">回到探索地图</button>
          </div>
        </main>

        <FocusDialog
          v-if="dialog !== null"
          :title="dialog === 'lesson' ? '又有一个新发现！' : '要休息一下吗？'"
          :message="
            dialog === 'lesson'
              ? '这一站已经点亮。继续出发，看看还有什么新发现。'
              : '你可以继续探索，也可以体验一次模拟宿主退出。'
          "
          :confirm-label="dialog === 'lesson' ? '返回探索地图' : '模拟退出'"
          @close="closeDialog"
          @confirm="confirmDialog"
        />
        <div v-if="notice" class="notice" role="status">{{ notice }}</div>
      </div>
    </div>
    <footer class="example-controls">
      <div class="remote">
        <button @click="dispatchNativeKey(19)">↑</button
        ><button @click="dispatchNativeKey(21)">←</button><button @click="activate">确定</button
        ><button @click="dispatchNativeKey(22)">→</button
        ><button @click="dispatchNativeKey(20)">↓</button
        ><button @click="dispatchNativeKey(4)">返回</button>
      </div>
      <div class="native-controls">
        <span>模拟原生桥</span
        ><button data-testid="native-right" @click="mockNative(22)">Android →</button
        ><button data-testid="native-back" @click="mockNative(4)">Android 返回</button
        ><small>{{ nativeLog }}</small>
      </div>
    </footer>
  </div>
</template>
