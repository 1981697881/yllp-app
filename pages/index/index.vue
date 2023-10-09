<template>
	<view>
		<scan-code></scan-code>
		<components v-if="PageCur == 'component'"></components>
	</view>
</template>
<script>
	import scanCode from '@/components/scan-code/scan-code.vue';
	import service from '../../service.js';
	import store from '@/store';
	import login from '@/api/login';
	import basic from '@/api/basic';
	import {
		mapState
	} from 'vuex';
	export default {
		components: {
			scanCode
		},
		data() {
			return {
				PageCur: 'component',
				totalSize: 0,
				baifen: 0
			};
		},
		computed: mapState(['forcedLogin', 'hasLogin', 'account']),
		created() {
			/**
			 * 默认登录，这情况为已登录过，而登录缓存还在，后台登录，前端不展示登录页
			 * 检测用户账号密码是否在已缓存的用户列表中
			 */
			if (service.getUsers().length > 0) {
				if (service.getUsers()[0].account != '' && service.getUsers()[0].account != 'undefined') {
					const data = {
						account: service.getUsers()[0].account,
						password: service.getUsers()[0].password
					};
					if (data.account && data.password) {
						const data = {
							username: data.account,
							acctID: "6407dc00ad6d48",
							lcid: "2052",
							password: data.password
						};
						basic.validateUser(data).then(res => {
							if (res.IsSuccessByAPI) {
								uni.showToast({
									icon: 'none',
									title: "登录成功",
								});
								service.clearUser();
								service.addUser(data);
								uni.setStorageSync('kdservice-sessionid', data.KDSVCSessionId);
							} else {
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
							return uni.reLaunch({
								url: '../login/login'
							});
						})
					}
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

			// #ifdef APP-PLUS
			plus.key.addEventListener(
				'backbutton',
				() => {
					if (back_k) {
						plus.runtime.quit();
					} else {
						uni.showToast({
							title: '再按一次退出应用',
							icon: 'none'
						});
					}
					back_k++;
					setTimeout(() => {
						back_k--;
					}, 3000);
				},
				false
			);
			// #endif
		},
		onLoad() {
			// #ifdef APP-PLUS
			this.plusReady();
			// #endif
			var that = this;
			uni.getSystemInfo({
				success: res => {
					if (res.platform == 'android') {
						that.AndroidCheckUpdate();
					}
				}
			});
			/* uni.$on('scancodedate',function(data){
			     // _this 这里面的方法用这个 _this.code(data.code)  
			 console.log('你想要的code：', data.code)  
			})  */
		},
		onUnload() {
			// 移除监听事件
			uni.$off('scancodedate');
		},
		methods: {
			NavChange: function(e) {
				this.PageCur = e.currentTarget.dataset.cur;
			}, // 获取当前版本号
			plusReady() {
				var that = this;
				// 获取本地应用资源版本号
				plus.runtime.getProperty(plus.runtime.appid, function(inf) {
					that.wgtVer = inf.version; //获取当前版本号
					that.version = plus.runtime.version;
				});
			},
			AndroidCheckUpdate2() {
				var that = this;
				uni.request({
					url: service.getUrls().url + '/pda/output.json', //获取最新版本号
					method: 'GET',
					data: {},
					success: res => {
						if (res.data[0].apkData.versionNamen > that.version) {
							if (plus.networkinfo.getCurrentType() != 3) {
								uni.showToast({
									title: '有新的版本发布，检测到您目前非Wifi连接，为节约您的流量，程序已停止自动更新，将在您连接WIFI之后重新检测更新。',
									mask: false,
									duration: 5000,
									icon: 'none'
								});
								return;
							}
							uni.showToast({
								title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序。',
								mask: false,
								duration: 5000,
								icon: 'none'
							});

							//res.data.androidurl    是apk的下载链接
							console.log('准备');
							var dtask = plus.downloader.createDownload(service.getUrls().url +
								'/pda/fzwmxy.apk', {},
								function(d, status) {
									console.log('开始');
									// 下载完成
									if (status == 200) {
										plus.runtime.install(plus.io.convertLocalFileSystemURL(d
										.filename), {}, {}, function(error) {
											uni.showToast({
												title: '安装失败',
												mask: false,
												duration: 1500
											});
										});
									} else {
										uni.showToast({
											title: '更新失败',
											mask: false,
											duration: 1500
										});
									}
								});
							dtask.start();
						}
					}
				});
			},
			/**
			 * 安卓应用的检测更新实现
			 */
			AndroidCheckUpdate: function() {
				var _this = this;
				uni.request({
					//请求地址，设置为自己的服务器链接
					url: service.getUrls().url + '/pda/output.json',
					method: 'GET',
					data: {},
					success: resMz => {
						console.log(resMz);
						var server_version = resMz.data[0].apkData.versionName;
						var currTimeStamp = new Date().getTime();
						// 判断缓存时间
						uni.getStorage({
							key: 'tip_version_update_time',
							success: function(res) {
								var lastTimeStamp = res.data;
								//定义提醒的时间间隔，避免烦人的一直提示，一个小时：3600；一天：86400
								var tipTimeLength = 3600;
								if (lastTimeStamp + tipTimeLength > currTimeStamp) {
									//避免多次提醒，不要更新
									console.log('避免多次提醒，不要更新');
								} else {
									//重新设置时间戳
									_this.setStorageForAppVersion(currTimeStamp);
									//进行版本型号的比对 以及下载更新请求
									_this.checkVersionToLoadUpdate(server_version, _this
										.version);
								}
							},
							fail: function(res) {
								_this.setStorageForAppVersion(currTimeStamp);
							}
						});
					},
					fail: () => {},
					complete: () => {}
				});
			},
			/**
			 * //设置应用版本号对应的缓存信息
			 * @param {Object} currTimeStamp 当前获取的时间戳
			 */
			setStorageForAppVersion: function(currTimeStamp) {
				uni.setStorage({
					key: 'tip_version_update_time',
					data: currTimeStamp,
					success: function() {
						console.log('setStorage-success');
					}
				});
			},
			downWgt: function() {
				var that = this;
				var downloadApkUrl = service.getUrls().url + '/pda/fzwmxy.apk';
				var dtask = plus.downloader.createDownload(downloadApkUrl, {}, function(d, status) {
					// 下载完成
					if (status == 200) {
						plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(
							error) {
							uni.showToast({
								title: '安装失败',
								mask: false,
								duration: 1500
							});
						});
					} else {
						uni.showToast({
							title: '下载更新失败'
						});
						plus.nativeUI.closeWaiting();
					}
				});
				//监听下载
				dtask.addEventListener('statechanged', function(download, status) {
					switch (download.state) {
						case 2:
							plus.nativeUI.showWaiting('正在下载...');
							break;
						case 3:
							//console.log("进度进度读取"+download.downloadedSize/that.totalSize*100);
							//进度条百分比 totalSize为总量，baifen为当前下载的百分比
							if (that.totalSize == 0) {
								that.totalSize = parseInt(download.totalSize);
							}
							if (parseInt((download.downloadedSize / that.totalSize) * 100) != that.baifen) {
								that.baifen = parseInt((download.downloadedSize / that.totalSize) * 100);
								plus.nativeUI.showWaiting('正在下载:' + that.baifen + '%');
							}
							break;
						case 4:
							uni.showToast({
								title: '下载完成'
							});
							plus.nativeUI.closeWaiting();
							break;
					}
				});
				dtask.start();
			},
			/**
			 * 进行版本型号的比对 以及下载更新请求
			 * @param {Object} server_version 服务器最新 应用版本号
			 * @param {Object} curr_version 当前应用版本号
			 */
			checkVersionToLoadUpdate: function(server_version, curr_version) {
				var that = this;
				if (server_version > curr_version) {
					//TODO 此处判断是否为 WIFI连接状态
					if (plus.networkinfo.getCurrentType() != 3) {
						uni.showToast({
							title: '有新的版本发布，检测到您目前非Wifi连接，为节约您的流量，程序已停止自动更新，将在您连接WIFI之后重新检测更新',
							mask: true,
							duration: 5000,
							icon: 'none'
						});
						return;
					} else {
						uni.showModal({
							title: '版本更新',
							content: '有新的版本发布，检测到您当前为Wifi连接，是否立即进行新版本下载？',
							confirmText: '立即更新',
							cancelText: '稍后进行',
							success: function(res) {
								if (res.confirm) {
									/* uni.showToast({
										icon: 'none',
										mask: true,
										title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',
										duration: 5000
									}); */
									that.downWgt(); //下载文件
									/* //设置 最新版本apk的下载链接
									var downloadApkUrl = service.getUrls().url+'/pda/fzwmxy.apk';
									var dtask = plus.downloader.createDownload(downloadApkUrl, {}, function(d, status) {
										// 下载完成
										if (status == 200) {
											plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(error) {
												uni.showToast({
													title: '安装失败',
													duration: 1500
												});
											});
										} else {
											uni.showToast({
												title: '更新失败',
												duration: 1500
											});
										}
									});
									dtask.start(); */
								} else if (res.cancel) {
									console.log('稍后更新');
								}
							}
						});
					}
				}
			}
		}
	};
</script>

<style></style>