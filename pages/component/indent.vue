<template>
	<view>
	<cu-custom bgColor="bg-gradual-blue" class="customHead" :isBack="true"><block slot="backText">返回</block><block slot="content">快速录单</block></cu-custom>
	<scroll-view scroll-y class="page" :style="{ 'height': pageHeight + 'px' }">
		<view class="nav-list">
			
		</view>
		<view class="cu-tabbar-height"></view>
	</scroll-view>
	<view class="cu-bar tabbar bg-white shadow foot">
		<view class="box text-center">
			<view class="btn-group">
				<button class="cu-btn bg-green shadow-blur" style="display: flex;">入库</button>
				<button class="cu-btn text-green line-green shadow" style="display: flex;">出库</button>
				<button class="cu-btn bg-green shadow-blur round" style="display: flex;">移库</button>
				<button class="cu-btn bg-blue shadow-blur round" style="display: flex;">盘点</button>
			</view>
		
		</view>
	</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageHeight: 0,
			};
		},
		onReady: function() {
			var me = this
			 uni.getSystemInfo({
			 　　success: function(res) { // res - 各种参数
			 　　   let info = uni.createSelectorQuery().select(".foot");
				 　let customHead = uni.createSelectorQuery().select(".customHead");
					 var infoHeight = 0;
					 var headHeight = 0;
			 　　　  　info.boundingClientRect(function(data) { //data - 各种参数
						infoHeight = data.height
			 　　    }).exec();
				 customHead.boundingClientRect(function(data) { //data - 各种参数
						headHeight = data.height
				 　 }).exec();
				 setTimeout(function () {
				 	me.pageHeight= res.windowHeight - infoHeight - headHeight
			 		}, 1000);
			      }
			 })
		},
		methods: {
		
		}
	}
</script>

<style>
	.box{
		width: 100%;
	}
	.nav-li {
		width: 60%;
		text-align: center;
		margin-left: 20%;
	}
	.page {
		height: 100vh;
	}
	.nav-list{
		margin-top: 5%;
	}
	.nav-title::first-letter {
	    font-size: 16px;
	    margin-right: 2px;
	}
</style>
