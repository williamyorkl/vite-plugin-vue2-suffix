import { createVuePlugin } from "vite-plugin-vue2";
import VitePluginVue2Suffix from "../../dist.js";

export default {
  plugins: [createVuePlugin(), VitePluginVue2Suffix()],
};
