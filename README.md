# vite-plugin-vue2-suffix

<h2 align='center'><samp>vite-plugin-vue2-suffix</samp></h2>

<p align='center'>A plugin solve missing '*.vue' suffix problem transform webpack to vite in vue2</p>

<br>

## Usage

> ℹ️ **Vite 2 is supported from `v0.6.x`, Vite 1's support is discontinued.**

Install

```bash
npm i vite-plugin-components -D
```

Add it to `vite.config.js`

```js
// vite.config.js
import { createVuePlugin } from "vite-plugin-vue2";
import VitePluginVue2Suffix from "../../src";

export default {
  plugins: [createVuePlugin(), VitePluginVue2Suffix()],
};
```

That's all.

Basically, it will automatically turn this

```vue
<template>
  <div class="block">
    <ComponentA msg="this is a A component" />
    <router-view></router-view>
  </div>
</template>

<script>
import ComponentA from "./components/ComponentA";

export default {
  components: {
    ComponentA,
  },
};
</script>
```

into this

```vue
<template>
  <div class="block">
    <ComponentA msg="this is a A component" />
    <router-view></router-view>
  </div>
</template>

<script>
import ComponentA from "./components/ComponentA/index.vue";

/** or if your component is in a outter path  */
// import ComponentA from './components/ComponentA.vue'

export default {
  components: {
    ComponentA,
  },
};
</script>
```

## License

MIT License © 2021 [williamyorkl](https://github.com/williamyorkl)
