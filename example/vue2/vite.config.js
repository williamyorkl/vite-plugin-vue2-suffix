import { createVuePlugin } from 'vite-plugin-vue2'
import VitePluginVue2Suffix from '../../src'

const config = {
  plugins: [
    createVuePlugin(),
    VitePluginVue2Suffix()
  ]
}

export default config
