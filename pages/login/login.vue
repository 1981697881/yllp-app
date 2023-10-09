<template>
	<view>
		<view class="cu-bar">
			<view></view>
			<view class="content" style="background-color: initial;padding: 0px;margin-top: 15rpx;font-size: 18px;">
				登录
			</view>
		</view>
		<view class="content">
			<view class="padding" style="text-align: center;">
				<image class="cu-avatar round imgxl margin-left" src="../../static/uugai.com-1595407574492.png"></image>
			</view>
			<view class="input-group">
				<view class="input-row border">
					<text class="title">账号：</text>
					<m-input class="m-input" type="text" clearable focus v-model="account"
						placeholder="请输入账号"></m-input>
				</view>
				<view class="input-row">
					<text class="title">密码：</text>
					<m-input type="password" displayable v-model="password" placeholder="请输入密码"></m-input>
				</view>
			</view>
			<view class="btn-row">
				<button type="primary" class="primary" @tap="bindLogin">登录</button>
			</view>

		</view>
	</view>

</template>

<script>
	import service from '../../service.js';
	import login from '@/api/login';
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import {
		config
	} from '@/plugins/request/js/config.js';
	import mInput from '@/components/m-input.vue'
	import basic from '../../api/basic/index.js';

	export default {
		components: {
			mInput
		},
		data() {
			return {
				providerList: [],
				hasProvider: false,
				modalName: null,
				account: '',
				password: '',
				positionTop: 0,
				popupForm: {
					URL: '',
				},
				isDevtools: false,
			}
		},
		created() {
			if (service.getUsers()[0].account != '' && typeof service.getUsers()[0].account != "undefined") {
				this.account = service.getUsers()[0].account
				this.password = service.getUsers()[0].password
			}
			// #ifdef APP-PLUS
			plus.key.addEventListener('backbutton', () => {
				if (back_k) {
					plus.runtime.quit();
				} else {
					uni.showToast({
						title: "再按一次退出应用",
						icon: 'none'
					});
				}
				back_k++
				setTimeout(() => {
					back_k--
				}, 3000)
			}, false);
			// #endif
		},
		computed: mapState(['forcedLogin']),
		methods: {
			...mapMutations(['login']),
			initPosition() {
				/**
				 * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
				 * 反向使用 top 进行定位，可以避免此问题。
				 */
				this.positionTop = uni.getSystemInfoSync().windowHeight - 100;
			},
			onLogin() {
				/**
				 * 默认登录，这情况为已登录过，而登录缓存还在，后台登录，前端不展示登录页
				 * 检测用户账号密码是否在已缓存的用户列表中
				 */
					if (service.getUsers()[0].account != '' && typeof service.getUsers()[0].account != "undefined") {
						const data = {
							username: service.getUsers()[0].account,
							acctID: "6407dc00ad6d48",
							lcid: "2052",
							password: service.getUsers()[0].password
						};
						basic.validateUser(data).then(res => {
							if(res.IsSuccessByAPI){
								uni.showToast({
									icon: 'none',
									title: "登录成功",
								});
								this.toMain(data);
							}else{
								uni.showToast({
									icon: 'none',
									title: res.Message,
								});
							}
						}).catch(err => {
							uni.showToast({
								icon: 'none',
								title: err.Message,
							});
						})
					} else {
						return
					}
				
			},
			hideModal(e) {
				this.modalName = null
			},
			bindLogin() {
					/**
					 * 客户端对账号信息进行一些必要的校验。
					 * 实际开发中，根据业务需要进行处理，这里仅做示例。
					 */
					if (this.account.length < 2) {
						uni.showToast({
							icon: 'none',
							title: '账号最短为 2 个字符'
						});
						return;
					}
					if (this.password.length < 5) {
						uni.showToast({
							icon: 'none',
							title: '密码最短为 5 个字符'
						});
						return;
					}
					/**
					 * 使用 uni.request 将账号信息发送至服务端，客户端在回调函数中获取结果信息。
					 */
					const data = {
						username: this.account,
						acctID: "6407dc00ad6d48",
						lcid: "2052",
						password: this.password
					};
					basic.validateUser(data).then(res => {
						if(res.IsSuccessByAPI){
							uni.showToast({
								icon: 'none',
								title: "登录成功",
							});
							this.toMain(data);
						}else{
							uni.showToast({
								icon: 'none',
								title: res.Message,
							});
						}
						
					}).catch(err => {
						uni.showToast({
							icon: 'none',
							title: err.msg,
						});
					})
				
			},
			getUserInfo({
				detail
			}) {
				if (detail.userInfo) {
					this.toMain(detail.userInfo.nickName);
				} else {
					uni.showToast({
						icon: 'none',
						title: '登陆失败'
					});
				}
			},
			toMain(data) {
				uni.setStorageSync('kdservice-sessionid', data.KDSVCSessionId);
				service.clearUser()
				service.addUser(data)
				/**
				 * 强制登录时使用reLaunch方式跳转过来
				 * 返回首页也使用reLaunch方式
				 */
				//if (this.forcedLogin) {
				uni.reLaunch({
					url: '../index/index',
				});
				/* } else {
					uni.navigateBack();
				} */

			}
		},
		onReady() {
			this.initPosition();
			//this.initProvider();
			// #ifdef MP-WEIXIN
			this.isDevtools = uni.getSystemInfoSync().platform === 'devtools';
			// #endif
		}
	}
</script>

<style>
	/* 原生组件模式下需要注意组件外部样式 */
	m-input {
		width: 100%;
		/* min-height: 100%; */
		display: flex;
		flex: 1;
	}

	.cu-bar {
		height: 140rpx;
		font-size: 16px;
		color:white;
		background-image: linear-gradient(107.7deg, rgb(101, 168, 143) -30.7%, rgb(144, 220, 193) 7.2%, rgb(225, 203, 150) 31.3%, rgb(251, 166, 150) 82.6%, rgb(250, 54, 65) 128.5%);

	}

	.cu-avatar.imgxl {
		width: 90px;
		height: 90px;
		font-size: 2.5em;
	}

	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 10px;
	}

	.input-group {
		background-color: #ffffff;
		margin-top: 20px;
		position: relative;
	}

	.input-group::before {
		position: absolute;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.input-group::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.input-row {
		display: flex;
		flex-direction: row;
		position: relative;
		font-size: 18px;
		line-height: 40px;
	}

	.input-row .title {
		width: 72px;
		padding-left: 15px;
	}

	.input-row.border::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 8px;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.btn-row {
		margin-top: 25px;
		padding: 10px;
	}

	button.primary {
		background-color: #0faeff;
	}

	.action-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.action-row navigator {
		color: #007aff;
		padding: 0 10px;
	}

	.oauth-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}

	.oauth-image {
		position: relative;
		width: 50px;
		height: 50px;
		border: 1px solid #dddddd;
		border-radius: 50px;
		margin: 0 20px;
		background-color: #ffffff;
	}

	.oauth-image image {
		width: 30px;
		height: 30px;
		margin: 10px;
	}

	.oauth-image button {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
</style>