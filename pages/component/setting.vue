<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">系统设置</block>
		</cu-custom>
		<scroll-view scroll-y class="page">
			<view class="cu-list menu" :class="[menuBorder ? 'sm-border' : '', menuCard ? 'card-menu margin-top' : '']" style="padding: 5px;">
				<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<view class="content">
						<image src="/static/logo.png" class="png" mode="aspectFit"></image>
						<text class="text-grey">系统设置</text>
					</view>
				</view>
				<view class="cu-item" :class="menuArrow ? 'arrow' : ''" @tap="$manyCk(checkUpload)">
					<!-- @tap="$manyCk(checkUpload)" -->
					<button class="cu-btn content" open-type="contact">
						<text class="cuIcon-btn text-olive"></text>
						<text class="text-grey">检查更新</text>
					</button>
					<view class="action">
						<view class="cu-tag round bg-olive light">{{ version }}</view>
					</view>
				</view>
				<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
					<button class="cu-btn content" open-type="contact" @tap="onLoginOut">
						<text class="cuIcon-discoverfill text-orange"></text>
						<text class="text-grey">退出登录</text>
					</button>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import service from '../../service.js';
import { mapMutations } from 'vuex';
export default {
	data() {
		return {
			version: '',
			totalSize: 0,
			 baifen: 0,
			 menuBorder: false,
			 menuArrow: false,
			 menuCard: false,
		};
	},
	onLoad() {
		this.plusReady();
	},
	methods: {
		...mapMutations(['logout']),
		onLoginOut() {
			const me = this;
			uni.showModal({
				title: '提示',
				content: '是否退出？',
				success: function(res) {
					if (res.confirm) {
						me.logout();
						service.clearUser();
						// 退出当前应用，改方法只在App中生效
						uni.reLaunch({
							url: '../login/login'
						});
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
			return true;
		},
		checkUpload() {
			var that = this;
			uni.getSystemInfo({
				success: res => {
					if (res.platform == 'android') {
						that.AndroidCheckUpdate();
					}
				}
			});
		},
		downWgt: function() {
			var that = this;
			var downloadApkUrl = service.getUrls().url+'/pda/fzwmxy.apk';
			var dtask = plus.downloader.createDownload(downloadApkUrl, {}, function(d, status) {
				// 下载完成
				if (status == 200) {
					plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(error) {
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
						console.log('正在下载');
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
						console.log('下载完成');
						uni.showToast({
							title: '下载完成'
						});
						plus.nativeUI.closeWaiting();
						break;
				}
			});
			dtask.start();
		},
		// 自动更新
		AndroidCheckUpdate() {
			var that = this;
			uni.request({
				url: service.getUrls().url+'/pda/output.json', //获取最新版本号
				method: 'GET',
				data: {}, 
				success: res => {
					/* basic.getAndroidVersion.then(res => {
					if (res.success) { */
					console.log(res.data[0].apkData.versionName +','+ that.version)
					if (res.data[0].apkData.versionName > that.version) {
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
										that.downWgt();
										//设置 最新版本apk的下载链接
										/* var downloadApkUrl = service.getUrls().url+'/pda/fzwmxy.apk';
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
					} else {
						uni.showToast({
							title: '当前版本已经是最新版本。',
							mask: false,
							duration: 5000,
							icon: 'none'
						});
					}
				}
			});
		},
		plusReady() { 
			var that = this;
			// 获取本地应用资源版本号
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				that.wgtVer = inf.version; //获取当前版本号
				that.version = plus.runtime.version;
			});
		}
	}
};
</script>

<style>
.nav-li {
	width: 60%;
	text-align: center;
	margin-left: 20%;
}
.page {
	height: 100vh;
}
.nav-list {
	margin-top: 5%;
}
.nav-title::first-letter {
	font-size: 16px;
	margin-right: 2px;
}
</style>
