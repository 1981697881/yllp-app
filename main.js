import Vue from 'vue'
import App from './App'
import store from './store'
import service from './service.js'
import login from '@/api/login'
import components from './pages/component/home.vue'
Vue.component('components',components)

import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom',cuCustom)
import Request from '@/plugins/request/js/index'
import {manyCk} from '@/plugins/comm/manyClick'

global.$http = Request();
Vue.prototype.$store = store
Vue.prototype.$manyCk = manyCk
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App,
	mounted(){
		 
	  }
})
app.$mount()

 



