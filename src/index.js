import fs from 'fs'
import * as TOOLS from './utils'


function VitePluginVue2Suffix() {
  return {
    name: 'vite-plugin-vue2-suffix',
    apply: 'serve',
    transform(code, id) {
      /**
       *
       * @param {String} filePathRaw 例如：'/Users/ex-liangyongpeng001/Documents/lbdp_ims_frontend_vite/src/views/generalManager/index'
       */
      
      const handleImport = (filePathRaw, compShortPath) => {
        if (filePathRaw.includes('.svg')) return
        if (filePathRaw.includes('.vue')) return // 已经有vue后缀的直接return
        if (!compShortPath.includes('/')) return // 防止第三方的插件

        try {
          // 检测文件读写权限
          fs.accessSync(`${filePathRaw}.vue`, fs.constants.R_OK)
          code = code.replace(`'${compShortPath}'`, `'${compShortPath}.vue'`)
        } catch (error) {
          // 如果判断到没有读写权限，则/index.vue
          code = code.replace(`'${compShortPath}'`, `'${compShortPath}/index.vue'`)
        }
      }

      /**
       * 1. *.vue的文件引入问题中，其它文件没有*.vue的问题
       */
      /** 处理vue文件后缀引入 */
      const handleVueSuffixImport = () => {
        if (id.includes('.vue') && !id.includes('?')) {
          const compoArr = TOOLS.handleGetCompoents(code)

          const { pathList, componentShortPath } = (compoArr && TOOLS.handleGetImportUrl(compoArr, code, id)) || ''

          if (compoArr && compoArr.length && pathList) {
            pathList.forEach((item, index) => {
              handleImport(item, componentShortPath[index])
            })
          }
        }
      }

      /**
       * 2. router.js路由文件引入问题，路由都没有.vue后缀
       *  1) 引入格式问题
       *  './component/xxx'
       *  '../layout/xxx'
       *  '@/component/xxx'
       *  './component/foo-xxx' // 命名不一致问题 component: { xxx }
       * 2）正则匹配问题
       *   a） import  静态引入
       *   b)  component 动态引入
       */

      /** 处理路由动态引入 */
      const addSuffixDynamicImportRoute = () => {
        // 1） 提取动态引入的路由页面 component: () => xxx
        const regRouter = /(?<=(component: \(\)\s\=\>\simport\(\')).*(?=(\'\)))/g
        const routePathArr = code.match(regRouter)

        // 1.1) 匹配路由的动态引入
        const dynamicImportPathList = TOOLS.handleFullPath(routePathArr, id)
        dynamicImportPathList &&
          dynamicImportPathList.forEach((path, index) => {
            const fileName = routePathArr[index]
            // const flagIndex = fileName.search(/(\/index\/indexKPIBoard)$/) > -1
            if (fileName.includes('.vue')) return
            try {
              // 检测文件读写权限
              fs.accessSync(`${path}.vue`, fs.constants.R_OK)
              code = code.replace(`'${fileName}'`, `'${fileName}.vue'`)
            } catch (error) {
              // 如果判断到没有读写权限，则/index.vue
              code = code.replace(`'${fileName}'`, `'${fileName}/index.vue'`)
            }
          })
      }

      /** 处理路由静态引入 */
      const addSuffixStaticImportRoute = () => {
        // 2） 提取页面组件 import xxx from 'xxx'
        const regImportRouter = /(?<=(import\s\w*\sfrom\s\'))(.*)(?=(\'))/g
        const routerImportArr = code.match(regImportRouter)

        // 2.1）匹配路由的非动态引入
        let newRouterImportArr = []
        routerImportArr &&
          routerImportArr.forEach((i) => {
            // console.log('handleRouteVueSuffixImport -> i', i)
            if (i.includes('.vue')) return
            if (i.includes('/views') || i.includes('/components')) {
              newRouterImportArr.push(`${i}`)
            }
          })

        const pathList = newRouterImportArr && TOOLS.handleFullPath(newRouterImportArr, id)

        if (newRouterImportArr && newRouterImportArr.length && pathList) {
          pathList.forEach((item, index) => {
            handleImport(item, newRouterImportArr[index])
          })
        }
      }

      const handleRouteVueSuffixImport = () => {
        if (id.includes('/router')) {
          addSuffixDynamicImportRoute()
          addSuffixStaticImportRoute()
        }
      }

      handleVueSuffixImport()
      handleRouteVueSuffixImport()
      return code
    }
  }
}

export default VitePluginVue2Suffix
