# vite-plugin-vue2-suffix

> it has been official inclued [detail](https://github.com/vitejs/awesome-vite#transformers)
> <br>

### A plugin solve missing '\*.vue' suffix problem transform webpack to vite in vue2

<br>

## Usage

Install

```bash
npm i vite-plugin-components -D
```

Add it to `vite.config.js`

```js
// vite.config.js
import { createVuePlugin } from "vite-plugin-vue2";
import VitePluginVue2Suffix from "vite-plugin-vue2-suffix";

export default {
  plugins: [createVuePlugin(), VitePluginVue2Suffix()],
};
```

That's all.

### Situation 1

> components using in another components

it will automatically turn this

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

/** or if your component is in a outside path  */
// import ComponentA from './components/ComponentA.vue'

export default {
  components: {
    ComponentA,
  },
};
</script>
```

### Situation 2

> components using in routes

also, it will turn this:

```js
import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const routerMap = [
  {
    path: "/news",
    component: () => import("../components/News"),
  },
];

export default new Router({
  scrollBehavior: () => ({
    y: 0,
    x: 0,
  }),
  routes: routerMap,
});
```

into this below:

```js
import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const routerMap = [
  {
    path: "/news",
    component: () => import("../components/News.vue"),
    /** or if your component is in a inside path */
    // component: () => import('../components/News/index.vue')
  },
];

export default new Router({
  scrollBehavior: () => ({
    y: 0,
    x: 0,
  }),
  routes: routerMap,
});
```

## License

MIT License © 2021 [williamyorkl](https://github.com/williamyorkl)
