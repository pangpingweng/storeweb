import Vue from 'vue'

import Cookies from 'js-cookie'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

import './assets/icons' // icon
import './permission' // permission control
import { getDicts } from "@/api/system/dict/data";
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, handleTree } from "@/utils/ruoyi";
// 分页组件
import Pagination from "@/components/Pagination";
// 自定义表格工具组件
import RightToolbar from "@/components/RightToolbar"
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 字典标签组件
import DictTag from '@/components/DictTag'
// 头部标签组件
import VueMeta from 'vue-meta'
// 字典数据组件
import DictData from '@/components/DictData'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree

// 全局组件挂载
Vue.component('DictTag', DictTag)
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('Editor', Editor)
Vue.component('FileUpload', FileUpload)
Vue.component('ImageUpload', ImageUpload)

Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
DictData.install()

import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap, {
  // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
  ak: '7xYG8lckDsFls0PwMGU2p0ZYHPyd9Xa6'
})

// import htmlToPdf from '@/components/utils/htmlToPdf'
// Vue.use(htmlToPdf)


// 注意 我使用的imageConversion版本为2.1.1，需要使用下面的形式导入
import * as imageConversion from 'image-conversion';

Vue.prototype.$elUploadBeforeUpload = function(file){
  //图片大小超过4M,长度超过2000就压缩
  return new Promise((resolve, reject) => {
    let _URL = window.URL || window.webkitURL
    let isLt2M = file.size / 1024 / 1024 > 0.5 // 判定图片大小是否小于0.5MB
    // 这里需要计算出图片的长宽
    let img = new Image()
    img.onload = function () {
      file.width = img.width // 获取到width放在了file属性上
      file.height = img.height // 获取到height放在了file属性上
      let valid = img.width > 1000 // 图片宽度大于2000
      console.log('压缩前', file)
      // 这里我只判断了图片的宽度,compressAccurately有多个参数时传入对象
      if (valid || isLt2M) {
        // 大小在500k以下，宽度1000以下
        imageConversion.compressAccurately(file, {
          size: 500,
          width: 1000 }).then(res => {
          console.log('压缩后', res)
          resolve(res)
        })
      } else {
        resolve(file)
      }
    } // 需要把图片赋值
    img.src = _URL.createObjectURL(file)
  })
};



/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
