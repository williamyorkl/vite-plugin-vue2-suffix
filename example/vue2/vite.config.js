import { createVuePlugin } from 'vite-plugin-vue2'
import VitePluginVue2Suffix from '../../src'

export default {
  plugins: [
    createVuePlugin(),
    VitePluginVue2Suffix()
  ]
}
