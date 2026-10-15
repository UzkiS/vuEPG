import "./polyfills";
import Vue from "vue";
import VuEPG from "vuepg";
import App from "./app.vue";
import "./style.css";

// 焦点元素被卸载（如关闭弹窗、筛选列表）后自动恢复焦点
Vue.use(VuEPG, { restoreFocus: true });
new Vue({ render: (createElement) => createElement(App) }).$mount("#app");
