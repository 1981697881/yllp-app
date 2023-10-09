<template>
	<view>
	<cu-custom bgColor="bg-gradual-blue" class="customHead" :isBack="true"><block slot="backText">返回</block><block slot="content">库存查询</block></cu-custom>
	<loading :loadModal="loadModal"></loading>
	<uni-fab
	:pattern="pattern"
	:horizontal="horizontal"
	:vertical="vertical"
	:popMenu="popMenu"
	distable
	:direction="direction"
	 @fabClick="fabClick"
	 ></uni-fab>
	 <view class="box getheight">
	 	<view class="cu-bar search bg-white" style="height: 30px;">
	 		<view class="search-form round">
	 			<text class="cuIcon-search"></text>
	 		<input :adjust-position="false" type="text" :value="keyword" @input="inputChange" placeholder="搜索" confirm-type="search"></input>
	 	</view>
	 	<view class="action">
	 		<button class="cu-btn bg-green shadow-blur round" @tap="$manyCk(search)">搜索</button>						</view>
	 	</view>
	 </view>
	<scroll-view scroll-y class="page" :style="{ 'height': pageHeight + 'px' }">
		<view v-for="(item,index) in cuIconList" :key="index">
				<view class="cu-list menu-avatar">
					<view class="cu-item" style="width: 100%;margin-top: 2px;height: 260upx;" >
						<view style="clear: both;width: 100%;" class="grid text-left col-2" data-target="Modal" data-number="item.number">
							<view class="text-grey">序号:{{item.index=(index + 1)}}</view>
							<view class="text-grey">编码:{{item.FNumber}}</view>
							<view class="text-grey">名称:{{item.FName}}</view>
							<view class="text-grey">规格:{{item.FModel}}</view>
							<view class="text-grey">仓库:{{item.FStockName}}</view>
							<view class="text-grey">库位:{{item.FStockPlacename}}</view>
							<view class="text-grey">批号:{{item.FBatchNo}}</view>
							<!-- <view class="text-grey">数量:{{item.FQty}}</view>
							<view class="text-grey">单位:{{item.FUnitName}}</view> -->
							<view class="text-grey">标签编码:{{item.FLabelNumber}}</view>
							<view class="text-grey">基本单位:{{item.FBUUnitName}}</view>
							<view class="text-grey">基本数量:{{item.FBUQty}}</view>
							<view class="text-grey">常用单位:{{item.FCUUnitName}}</view>
							<view class="text-grey">常用数量:{{item.FCUUQty}}</view>
						</view>
					</view>
				</view>
		</view>
	</scroll-view>
	<text v-if="isShow" class="loading-text">{{ loadingType === 0 ? contentText.contentdown : loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore }}</text>
	</view>
</template>

<script>
	import basic from '@/api/basic';
	var _self,
		page = 1;
	export default {
		data() {
			return {
				loadingType: 0,
				contentText: {
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多数据了'
				},
				isShow: true,
			keyword: '',
			pageHeight: 0,
			cuIconList: [],
			loadModal: false,
			onoff: true,
			horizontal: 'right',
			vertical: 'bottom',
			popMenu: false,
			direction: 'horizontal',
			pattern: {
				color: '#7A7E83',
				backgroundColor: '#fff',
				selectedColor: '#007AFF',
				buttonColor: '#007AFF'
			},
			};
		},
		onReady: function() {
			_self = this
				 var me = this
				 uni.getSystemInfo({
				 　　success: function(res) { // res - 各种参数
				 　　   let info = uni.createSelectorQuery().select(".getheight");
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
				 });
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getNewsList();
		},
		// 上拉加载
		onReachBottom: function() {
			this.isShow = false
			page++; //每触底一次 page +1
			// console.log(_self.cuIconList.length);
			if (_self.loadingType != 0) {
				//loadingType!=0;直接返回
				return false;
			}
			_self.loadingType = 1;
			// console.log(page);
			uni.showNavigationBarLoading(); //显示加载动画
			let obj = this.qFilter()
			obj.pageNum = page
			basic
				.inventoryList(obj)
				.then(res => {
					if (res.success) {
						console.log(res)
						if (_self.cuIconList.length == res.data.total) {
							//没有数据
							_self.loadingType = 2;
							uni.hideNavigationBarLoading(); //关闭加载动画
							return false;
						}
						if(res.data.list.length>0){
							let dList = res.data.list
							dList.forEach((item,index) => {
								_self.cuIconList.push(item)
							})
						} 
						/* for (var i = _self.cuIconList.length; i < res.data.total; i++) {
							_self.cuIconList = _self.cuIconList.concat(res.data.list[i - 1]); //将数据拼接在一起
						} */
						_self.loadingType = 0; //将loadingType归0重置
						uni.hideNavigationBarLoading(); //关闭加载动画
						uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
						this.isShow = true
					}
				})
				.catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.msg
					});
				});
		},
		methods: {
			// 产品列表数据
			getNewsList: function() {
			   //第一次回去数据 
				_self.loadingType = 0;
				uni.showNavigationBarLoading();
				const me = this;
				basic
					.inventoryList(this.qFilter())
					.then(res => {
						if (res.success) {
							console.log(res);
							_self.cuIconList = res.data.list;
							uni.hideNavigationBarLoading();
							uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
						} 
					})
					.catch(err => {
						uni.showToast({
							icon: 'none',
							title: err.msg
						});
					});
			},
			inputChange(e){
			    this.keyword = e.detail.value
			 },
		fabClick() {
			var that = this
			let resultA = []
			uni.scanCode({
				success:function(res){
					if(resultA.indexOf(res.result)==-1) {
						basic.inventoryByBarcode({'uuid':res.result}).then(reso => {
						if(reso.success){
							if(reso.data.length > 0){
								for(let i in reso.data) {
									that.cuIconList.push(reso.data[i])				
								}	 
							}else{
								uni.showToast({
									icon: 'none',
									title: '无数据',
								});
							}
						}
						}).catch(err => {
							uni.showToast({
								icon: 'none',
								title: err.msg,
							});
						})
						resultA.push(res.result)
					}
				}
			});
		},
		// 查询条件过滤
		qFilter() {
	       let obj = {}
	       this.keyword != null && this.keyword != '' ? obj.name = this.keyword : null
			obj.pageSize = 20;
			obj.pageNum = 1;
			return obj
		},
		search(){
			const me = this
			if (this.keyword != null && typeof this.keyword != 'undefined') {
				me.getNewsList()
			}else{
				uni.showToast({
					icon: 'none',
					title: '格式错误'
				});
				return;
				}
			
		},
		}
	}
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
	.nav-list{
		margin-top: 5%;
	}
	.nav-title::first-letter {
	    font-size: 16px;
	    margin-right: 2px;
	}
	.loading-text {
		height: 80upx;
		line-height: 80upx;
		font-size: 30upx;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
</style>
