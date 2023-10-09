<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" class="customHead" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">汇报列表</block>
		</cu-custom>
		<view class="box getheight">
			<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
				<view class="action">
					开始时间:
					<ruiDatePicker fields="day" class='ruidata' start="2010-00-00" end="2030-12-30" :value="start"
						@change="bindChange1"></ruiDatePicker>
				</view>
				<view class="action">
					结束时间:
					<ruiDatePicker fields="day" class='ruidata' start="2010-00-00" end="2030-12-30" :value="end"
						@change="bindChange2"></ruiDatePicker>
				</view>
			</view>
			<view class="cu-bar search bg-white" style="height: 60upx;">
				<view class="search-form round">
					<text class="cuIcon-search"></text>
					<input :adjust-position="false" type="text" :value="keyword" @input="inputChange"
						placeholder="单据号/产品编码/产品名称/产品型号/操作工" confirm-type="search"></input>
				</view>
				<view class="action">
					<button class="cu-btn bg-green shadow-blur round" @tap="$manyCk(search)">搜索</button>
				</view>
			</view>
		</view>
		<scroll-view scroll-y class="page" :style="{ 'height': pageHeight + 'px' }">
			<view v-for="(item,index) in cuIconList" :key="index">
				<view class="cu-list menu-avatar">
					<view class="cu-item" style="width: 100%;margin-top: 2px;padding:15rpx 0 15rpx 0;height: auto;">
						<view style="clear: both;width: 100%;" @tap="$manyCk(showList(index, item))"
							class="grid text-left col-2" data-target="Modal" data-number="item.number">
							<view class="text-grey">{{index+1}}</view>
							<!-- <view class="text-grey">
								<checkbox class='round blue' @click="chooseBox(item)"></checkbox>
							</view> -->
							<view class="text-grey">派工单号:{{item.FBillNo}}</view>
							<view class="text-grey">日期:{{item.FDate}}</view>
							<view class="text-grey">任务单号:{{item.FICMONO}}</view>
							<view class="text-grey">计划单号:{{item.FProduceTaskNo}}</view>
							<view class="text-grey">产品编码:{{item.FItemNumber}}</view>
							<view class="text-grey" style="width: 100%;">产品名称:{{item.FItemName}}</view>
							<view class="text-grey">规格型号:{{item.FModel}}</view>
							<view class="text-grey">工序序号:{{item.FOrderNo}}</view>
							<view class="text-grey">工序代码:{{item.FAlternateNumber}}</view>
							<view class="text-grey">工序名称:{{item.FAlternateName}}</view>
							<view class="text-grey">派工量:{{item.FWBSentNum}}</view>
							<view class="text-grey">汇报数量:{{item.FRepQty}}</view>
							<view class="text-grey">未汇报数量:{{item.FWBSentNum-item.FRepQty <0 ? '0':  item.FWBSentNum-item.FRepQty}}</view>
							<view class="text-grey">操作工:{{item.FWorkerName}}</view>
							<view class="text-grey">汇报状态:{{item.FReportStatus}}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- <view class="cu-bar tabbar shadow foot">
				<view class="box text-center">
					<button :disabled="isClick" class="cu-btn bg-green shadow-blur round lg" style="width: 40%;"
						@tap="$manyCk(showList(index, item))">汇报</button>
				</view>
			</view> -->
		</scroll-view>
		<text v-if="isShow"
			class="loading-text">{{ loadingType === 0 ? contentText.contentdown : loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore }}</text>
	</view>
</template>
<script>
	import ruiDatePicker from '@/components/rattenking-dtpicker/rattenking-dtpicker.vue';
	import workshop from '@/api/workshop';
	import basic from '@/api/basic';
	var _self,
		page = 1;
	export default {
		components: {
			ruiDatePicker
		},
		data() {
			return {
				loadingType: 0,
				contentText: {
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多数据了'
				},
				isShow: true,
				isClick: false,
				isScan: false,
				start: '',
				end: '',
				keyword: '',
				onoff: true,
				pageHeight: 0,
				cuIconList: [],
			};
		},
		onHide() {
			// 移除监听事件
			uni.$off('scancodedate');
		},
		onShow: function(option) {
			_self = this;
			_self.secondFocus = false; // 每次都要初始化 focus 属性
			setTimeout(() => {
					_self.secondFocus = true; // this.secondFocus 是第二个文本框的 focus 属性。
				},
				1000);
			uni.$on('scancodedate', function(data) {
				// _this 这里面的方法用这个 _this.code(data.code)
				let resData = data.code;
				_self.keyword = resData
				_self.isScan = true
				var obj = {}
				obj.billNo = resData
				obj.tranType = 1002534
				obj.type = 2
				obj.pageSize = 20;
				obj.pageNum = 1;
				_self.getNewsList(obj);
			});

			this.isClick = false
			uni.$on("handleBack", res => {
				this.start = res.startDate
				this.end = res.endDate
				_self.isScan = false
				this.getNewsList()
				// 清除监听
				uni.$off('handleBack')
			})
		},
		onLoad: function(option) {
			if (JSON.stringify(option) != "{}") {
				this.start = option.startDate
				this.end = option.endDate 
				this.getNewsList()
			} else {
				this.start = this.getDay('', -30).date
				this.end = this.getDay('', 0).date
				this.getNewsList()
			}
		},
		onReady: function() {
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
					setTimeout(function() {
						me.pageHeight = res.windowHeight - infoHeight - headHeight
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
				.getOrderList(obj).then(res => {
					if (res.success) {
						if (res.data.list.length > 0) {
							let dList = res.data.list
							dList.forEach((item, index) => {
								_self.cuIconList.push(item)
							})
						}else{
							//没有数据
							_self.loadingType = 2;
							uni.hideNavigationBarLoading(); //关闭加载动画
							return false;
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
			getNewsList: function(val = this.qFilter()) {
				//第一次回去数据
				uni.showNavigationBarLoading();
				const me = this;
				me.loadingType = 0;
				const obj = {
					pageSize: 50,
					pageNum: 1,
				}
				basic
					.getOrderList(val).then(res => {
						if (res.success) {
							me.cuIconList = res.data.list;
							if (me.isScan) {
								if (res.data.list.length > 0) {
									uni.navigateTo({
										url: '../workshop/reportDetails?cutList=' + encodeURIComponent(JSON
												.stringify(res.data.list[0])) + '&startDate=' + me
											.start + '&endDate=' + me.end
									});
								}
							}
							uni.hideNavigationBarLoading();
							uni.stopPullDownRefresh(); //得到数据后停止下拉刷新
						}
					})
					.catch(err => {
						uni.hideNavigationBarLoading();
						uni.stopPullDownRefresh(); 
						uni.showToast({
							icon: 'none',
							title: err.msg
						});
					});
			},
			chooseBox(item) {
				if (item.checked) {
					this.$set(item, "checked", false);
				} else {
					this.$set(item, "checked", true);
				}
			},
			showList(index, item) {
				let array = []
				uni.navigateTo({
					url: '../workshop/reportDetails?cutList=' + encodeURIComponent(JSON.stringify(item)) +
						'&startDate=' + this.start + '&endDate=' + this.end
				});
				/* let list = this.cuIconList
				if (list.length > 0) {
					this.isClick = true
					list.forEach((item, index) => {
						if (item.checked) {
							array.push(item)
						}
					})
					uni.navigateTo({
						url: '../workshop/reportDetails?cutList=' + encodeURIComponent(JSON.stringify(array)) +
							'&startDate=' + this.start + '&endDate=' + this.end
					});
				} else {
					uni.showToast({
						icon: 'none',
						title: '无汇报数据',
					});
				} */
			},
			fetchData(val = '') {
				const me = this
				const obj = {
					pageSize: 50,
					pageNum: 1,
				}
				basic
					.getOrderList(this.qFilter()).then(res => {
						if (res.success) {
							let data = res.data.list
							data.forEach((item, index) => {
								item.checked = false
							})
							me.cuIconList = data
						}
					}).catch(err => {
						uni.showToast({
							icon: 'none',
							title: res.msg,
						});
					})
			},
			// 查询前后三天日期
			getDay(date, day) {
				var today = new Date();
				var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
				today.setTime(targetday_milliseconds) //注意，这行是关键代码
				var tYear = today.getFullYear()
				var tMonth = today.getMonth()
				var tDate = today.getDate()
				var getDay = today.getDay()
				tMonth = this.doHandleMonth(tMonth + 1)
				tDate = this.doHandleMonth(tDate)
				var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
				var week = weeks[getDay]
				return {
					day: tDate,
					week: week,
					date: tYear + "-" + tMonth + "-" + tDate
				}
			},
			doHandleMonth(month) {
				var m = month;
				if (month.toString().length == 1) {
					m = "0" + month;
				}
				return m;
			},
			inputChange(e) {
				this.keyword = e.detail.value
				this.fetchData(e.detail.value)
			},
			compareDate(date1, date2) {
				var oDate1 = new Date(date1);
				var oDate2 = new Date(date2);
				if (oDate1.getTime() > oDate2.getTime()) {
					return true; //第一个大
				} else {
					return false; //第二个大
				}
			},
			// 查询条件过滤
			qFilter() {
				let obj = {}
				this.keyword != null && this.keyword != '' ? obj.billNo = this.keyword : null
				this.start != null && this.start != undefined ? obj.startDate = this.start : null
				this.end != null && this.end != undefined ? obj.endDate = this.end : null
				obj.tranType = 1002534
				obj.type = 2
				obj.pageSize = 20;
				obj.pageNum = 1;
				return obj
			},
			bindChange1(e) {
				this.start = e
			},
			bindChange2(e) {
				this.end = e
			},
			search() {
				const me = this
				if (this.start.length > 5 && this.end.length > 5) {
					if (!this.compareDate(this.start, this.end)) {
						me.getNewsList()
					} else {
						uni.showToast({
							icon: 'none',
							title: '结束日期不能大于开始日期'
						});
						return;
					}
				} else {
					uni.showToast({
						icon: 'none',
						title: '日期格式错误'
					});
					return;
				}

			},
		}
	}
</script>

<style>
	.action {
		font-size: 13px !important;
	}

	.ruidata {
		font-size: 13px;
		height: 7vw !important;
	}

	.box {
		width: 100%;
	}

	.cu-bar {
		min-height: 30px;
	}

	/* .page {
		height: calc(100vh - 75px);
	} */
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
