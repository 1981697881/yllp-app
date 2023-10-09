<template >
	<view style="margin-top: 14% !important;">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">文档查询</block>
		</cu-custom>
		<web-view :src="allUrl" @message="getMessage"></web-view>
	</view>
</template>

<script>
import basic from '@/api/basic';
export default {
	data() {
		return {
			src: '',
			allUrl: '',
			viewerUrl: 'http://xyy.gzfzdev.com:8866/xyy/web/viewer.html' // 格式化文件流的一个js 文件 文末会分享出来
		};
	},
	onLoad(options) {
		var height=0;//定义动态的高度变量，如高度为定值，可以直接写
		uni.getSystemInfo({
		//成功获取的回调函数，返回值为系统信息
		success: (sysinfo) => {
		height = sysinfo.windowHeight-47;//自行修改，自己需要的高度
			},
			complete: () => {
			}
		});
		var currentWebview = this.$scope.$getAppWebview();//获取当前web-view
		setTimeout(function() {
		var wv = currentWebview.children()[0];
		wv.setStyle({//设置web-view距离顶部的距离以及自己的高度，单位为px
			top: 68,
			height:height
			}) 
		}, 1000)
		let fileUrl = 'https://tz.xinyuanhengye.cn:8088/tz.html?file='+options.chartNumber+'.pdf'; // encodeURIComponent 函数可把字符串作为 URI 组件进行编码。
		//this.allUrl = this.viewerUrl + '?file=' + fileUrl;
		this.allUrl = fileUrl;
		console.log(this.allUrl);
	},
	methods: {
		getMessage(e) {
			console.log(e);
			let data = e.detail.data;
			console.log(JSON.stringify(data));
		}
	}
};
</script>

<style>
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
