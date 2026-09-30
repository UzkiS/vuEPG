import "./polyfills";
import Vue from "vue";
import VuEPG from "vuepg";
import App from "./app.vue";
import "./style.css";

Vue.use(VuEPG);
new Vue({ render: (createElement) => createElement(App) }).$mount("#app");
