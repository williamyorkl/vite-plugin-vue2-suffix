import fs from 'fs';
import path from 'path';

// 相对路径转换成绝对路径的【前缀】
const fullPathPrefix = (m, id) => {
  // 处理import时的路径引入问题
  /**
   *  './component/xxx'
   *  '../layout/xxx'
   *  '@/component/xxx'
   *  './component/foo-xxx' // 命名不一致问题 component: { xxx }
   */

  if (m.includes('@')) {
    return process.cwd() + '/src'
  } else {
    return path.parse(id).dir // 返回当前文件下路径
  }
};

/**
 *
 * @param {string} code 返回识别*.vue文件里 component {} 里面的值
 */
function handleGetCompoents(code) {
  // 匹配components: { xxx, xxx}, 匹配结果为如下：
  /**
   * {
   *  xxx1,
   *  xxx2,
   *  xxx3
   *  }
   */
  const regExp = /(?<=components:(\s)*)({(?:[^}]+)})/g;
  let regComponent = code.match(regExp);

  // 去掉 “// ” 的注释
  regComponent = regComponent && regComponent[0].replace(/\/\/(.*)/g, '');

  // 通过 “,” 分隔开componet元素
  regComponent = regComponent && regComponent.split(',');

  let componentList = regComponent && regComponent.map((w) => w.replace(/\n*/g, '').replace(/\s*/g, '').replace(/{/, '').replace(/}/, ''));

  return componentList
}

// 处理 *.vue 里面的 import 语句
/**
 *
 * @param {Array}} componentNameArray 组件名数组
 */
function handleGetImportUrl(componentNameArray, code, id) {
  if (!componentNameArray) return
  const compoentMatchArr = componentNameArray.join('|');
  const regExp = new RegExp(`(?<=(import\\s(${compoentMatchArr})\\sfrom\\s))(\\'(.*)\\')`, 'g');

  let regComponent = code.match(regExp) && code.match(regExp).map((m) => m.replace(/\'/g, ''));
  // console.log('handleGetImportUrl -> regComponent', regComponent)

  return {
    pathList: handleFullPath(regComponent, id),
    componentShortPath: regComponent
  }

  // return handleFullPath(regComponent, id)
}

// 把相对路径都处理成绝对路径
/**
 *
 * @param {Array} regComponent 通过用正则match匹配后的数组
 */
function handleFullPath(regComponent, id) {
  return (
    regComponent &&
    regComponent.map((m) => {
      if (m.includes('@')) {
        let mAfter = m.replace('@/', '');
        return path.join(fullPathPrefix(m, id), mAfter)
      } else {
        return path.resolve(fullPathPrefix(m, id), m)
      }
    })
  )
}

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
          fs.accessSync(`${filePathRaw}.vue`, fs.constants.R_OK);
          code = code.replace(`'${compShortPath}'`, `'${compShortPath}.vue'`);
        } catch (error) {
          // 如果判断到没有读写权限，则/index.vue
          code = code.replace(`'${compShortPath}'`, `'${compShortPath}/index.vue'`);
        }
      };

      /**
       * 1. *.vue的文件引入问题中，其它文件没有*.vue的问题
       */

      /** 处理vue文件后缀引入 */
      const handleVueSuffixImport = () => {
        if (id.includes('.vue') && !id.includes('?')) {
          const compoArr = handleGetCompoents(code);

          const { pathList, componentShortPath } = (compoArr && handleGetImportUrl(compoArr, code, id)) || '';

          if (compoArr && compoArr.length && pathList) {
            pathList.forEach((item, index) => {
              handleImport(item, componentShortPath[index]);
            });
          }
        }
      };

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
        const regRouter = /(?<=(component: \(\)\s\=\>\simport\(\')).*(?=(\'\)))/g;
        const routePathArr = code.match(regRouter);

        // 1.1) 匹配路由的动态引入
        const dynamicImportPathList = handleFullPath(routePathArr, id);
        dynamicImportPathList &&
          dynamicImportPathList.forEach((path, index) => {
            const fileName = routePathArr[index];
            // const flagIndex = fileName.search(/(\/index\/indexKPIBoard)$/) > -1
            if (fileName.includes('.vue')) return
            try {
              // 检测文件读写权限
              fs.accessSync(`${path}.vue`, fs.constants.R_OK);
              code = code.replace(`'${fileName}'`, `'${fileName}.vue'`);
            } catch (error) {
              // 如果判断到没有读写权限，则/index.vue
              code = code.replace(`'${fileName}'`, `'${fileName}/index.vue'`);
            }
          });
      };

      /** 处理路由静态引入 */
      const addSuffixStaticImportRoute = () => {
        // 2） 提取页面组件 import xxx from 'xxx'
        const regImportRouter = /(?<=(import\s\w*\sfrom\s\'))(.*)(?=(\'))/g;
        const routerImportArr = code.match(regImportRouter);

        // 2.1）匹配路由的非动态引入
        let newRouterImportArr = [];
        routerImportArr &&
          routerImportArr.forEach((i) => {
            // console.log('handleRouteVueSuffixImport -> i', i)
            if (i.includes('.vue')) return
            if (i.includes('/views') || i.includes('/components')) {
              newRouterImportArr.push(`${i}`);
            }
          });

        const pathList = newRouterImportArr && handleFullPath(newRouterImportArr, id);

        if (newRouterImportArr && newRouterImportArr.length && pathList) {
          pathList.forEach((item, index) => {
            handleImport(item, newRouterImportArr[index]);
          });
        }
      };

      const handleRouteVueSuffixImport = () => {
        if (id.includes('/router')) {
          addSuffixDynamicImportRoute();
          addSuffixStaticImportRoute();
        }
      };

      handleVueSuffixImport();
      handleRouteVueSuffixImport();
      return code
    }
  }
}

export { VitePluginVue2Suffix as default };
