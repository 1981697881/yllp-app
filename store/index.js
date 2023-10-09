//引入vue和vuex
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
//蓝牙设置
import Bluetooth from '@/store/bluetooth/index.js'
const store = new Vuex.Store({ //全局变量定义
	modules: {
		Bluetooth
	},
	state: {
		sysinfo: uni.getSystemInfoSync(), //系统信息
		forcedLogin: false, //是否需要强制登录
		hasLogin: false,
		account: "",
		password: "",
		userId: '',
		token: '',
		pointId: '',
	},
	mutations: {
		login(state, user) {
			state.account = user.account || '';
			state.password = user.password || '';
			state.hasLogin = true;
			state.userId = user.id || '';
			state.token = user.token || '';
		},
		logout(state) {
			state.account = "";
			state.hasLogin = false;
			state.userId = '';
			state.token = '';
			state.pointId = '';
		},
		setToken(state, user) {
			state.token = user.token || '';
		}
	}
})
export default store
