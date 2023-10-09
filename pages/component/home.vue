<template name="components">
	<view>
		<scroll-view scroll-y class="page">
			<view class="cu-bar">
				<view></view>
				<view class="content" style="margin-top: 15rpx;">主页</view>
				<view class="action" style="margin-top: 15rpx;">
					<navigator :url="'/pages/component/setting'"><text class="cuIcon-settings"
							style="font-size: 21px;"></text></navigator>
				</view>
			</view>
			<view class="nav-list">
				<navigator hover-class="none" :url="'/pages/component/' + item.path" class="nav-li"
					navigateTo :class="'bg-' + item.color" v-for="(item, index) in elements" :key="index">
					<view class="nav-title">{{ item.name }}</view>
					<text :class="'cuIcon-' + item.cuIcon"></text>
				</navigator>
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
	</view>
</template>

<script>
	import service from '@/service.js';
	import basic from '@/api/basic';
	import login from '@/api/login';
	export default {
		created() {
			if (service.getUsers().length > 0) {
				if (service.getUsers()[0].account != '' && service.getUsers()[0].account != 'undefined') {

				} else {
					return uni.reLaunch({
						url: '../login/login'
					});
				}
			} else {
				return uni.reLaunch({
					url: '../login/login'
				});
			}
		},
		data() {
			return {
				modalName: null,
				chartNumber: '',
				elements: [
					{
						name: "装箱管理",
						color: "olive",
						path: "workshop/dispatching",
						cuIcon: "pick",
					}
				]
			};
		},
		methods: {}
	};
</script>

<style>
	.page {
		height: 100vh;
	}

	.nav-list {
		margin-top: 5%;
	}

	.cu-bar {
		height: 140rpx;
		align-item: center;
		color:white;
		background-image: linear-gradient(107.7deg, rgb(101, 168, 143) -30.7%, rgb(144, 220, 193) 7.2%, rgb(225, 203, 150) 31.3%, rgb(251, 166, 150) 82.6%, rgb(250, 54, 65) 128.5%);

	}
	.nav-title::first-letter {
		font-size: 16px;
		margin-right: 2px;
	}
</style>