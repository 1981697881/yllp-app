<template>

</template>

<script>
	// 引入
	import Bluetooth from '@/common/bluetooth.js';
	import {
		mapState
	} from 'vuex'
	export default {
		components: {

		},
		data() {
			return {

			}
		},
		created() {
			// 开始搜索蓝牙
			Bluetooth.startSearch();
			// 绑定蓝牙
			Bluetooth.bindViewTap(e);
		},
		onLoad() {
			// 监听自定义的已连接上蓝牙事件
			uni.$on('bluetoothReady', (data) => {
				this.bluetoothReady = data;
			});
		},
		// 销毁页面时停止监听
		onUnload() {
			// 停止蓝牙监听
			if (Bluetooth.isSearching) {
				Bluetooth.stopSearch();
			}
		},
		// 放在vuex中动态监听蓝牙列表
		computed: {
			...mapState({
				bluetoothList: state => state.Bluetooth.bluetoothList
			})
		},

	}
</script>

<style>
</style>
