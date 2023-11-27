<template>
	<view>
		<cu-custom bgColor="bg-gradual-gradient" class="customHead" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">待出库列表</block>
		</cu-custom>
		<uni-fab :pattern="pattern" :horizontal="horizontal" :vertical="vertical" cuIcon="pick" :popMenu="popMenu"
			distable :direction="direction" @fabClick="fabClick"></uni-fab>
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
					<input :adjust-position="false" type="text" :value="keyword" @input="inputChange" placeholder="单据号"
						confirm-type="search"></input>
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
						<view style="clear: both;width: 100%;" class="grid text-left col-2"
							@tap="$manyCk(showList(index, item))" data-target="Modal" data-number="item.number">
							<view class="text-grey">序号:{{index+1}}</view>
							<view class="text-grey">日期:{{item[3].substring(0, 10)}}</view>
							<view class="text-grey">送货单号:{{item[0]}}</view>
							<view class="text-grey" style="width: 100%;">客户:{{item[2]}}</view>
							<view class="text-grey" style="width: 100%;">备注:{{item[7]}}</view>
						</view>
					</view>
				</view> 
			</view>
		</scroll-view>
		<!-- <text v-if="isShow" class="loading-text">{{ loadingType === 0 ? contentText.contentdown : loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore }}</text> -->
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
				start: '',
				end: '',
				keyword: '',
				onoff: true,
				pageHeight: 0,
				cuIconList: [],
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
		onHide() {
			// 移除监听事件
			uni.$off('scancodedate');
		},
		onShow: function(option) {
			uni.hideNavigationBarLoading();
			_self = this;
			uni.$on('scancodedate', function(data) {
				// _this 这里面的方法用这个 _this.code(data.code)
				let resData = data.code;
				var obj = {}
				_self.keyword = resData
				obj.billNo = resData
				obj.tranType = 1002535
				obj.type = 2
				obj.pageSize = 20;
				obj.pageNum = 1;
				_self.getNewsList();
			});
			/* uni.$on("handleBack", res => {
				this.start = res.startDate
				this.end = res.endDate
				this.getNewsList()
				// 清除监听
				uni.$off('handleBack')
			}) */
			//this.getNewsList()
		},
		onLoad: function(option) {
			uni.hideNavigationBarLoading();
			if (JSON.stringify(option) != "{}") {
				this.start = option.startDate
				this.end = option.endDate
				this.getNewsList()
			} else {
				this.start = this.getDay('', -7).date
				this.end = this.getDay('', 7).date
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
			/* this.isShow = false
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
				.executeBillQuery(_self.qFilter()).then(res => {
					if (res.success) {
						if (res.data.list.length > 0) {
							let dList = res.data.list
							dList.forEach((item, index) => {
								_self.cuIconList.push(item)
							})
						} else {
							//没有数据
							_self.loadingType = 2;
							uni.hideNavigationBarLoading(); //关闭加载动画
							return false;
						}
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
				}); */
		},
		methods: {
			fabClick() {
				uni.navigateTo({
					url: '../workshop/dispatchingDetails',
				});
			}, 
			// 产品列表数据
			getNewsList: function(val = this.qFilter()) {
				//第一次回去数据
				this.loadingType = 0;
				uni.showNavigationBarLoading();
				const me = this;
				const obj = {
					pageSize: 50,
					pageNum: 1,
				}
				basic
					.executeBillQuery(val).then(res => {
							let reso = res[0];
							uni.hideNavigationBarLoading();
							uni.stopPullDownRefresh(); 
							if (res.length>0) {
								_self.cuIconList = [ ...res]
								console.log(_self.cuIconList)
								console.log(1)
							}else{
								uni.showToast({
									icon: 'none',
									title: reso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
								})
							}
					})
					.catch(err => {
						uni.hideNavigationBarLoading();
						uni.stopPullDownRefresh();
						uni.showToast({
							icon: 'none',
							title: err[0][0]['Result']['ResponseStatus']['Errors'][0]['Message']
						});
					});
			},
			showList(index, item) {
				item.startDate = this.start
				item.endDate = this.end
				uni.navigateTo({
					url: '../workshop/packing?obj=' + encodeURIComponent(JSON.stringify(item)),
				});
			},
			fetchData(val = '') {
				const me = this
				const obj = {
					pageSize: 50,
					pageNum: 1,
				}
				basic
					.executeBillQuery(me.qFilter()).then(res => {
						let reso = res[0];
						if (res.length>0) {
							me.cuIconList = [ ...res]
							console.log(me.cuIconList)
							console.log(1)
						}else{
							uni.showToast({
								icon: 'none',
								title: reso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
							})
						}
					}).catch(err => {
						uni.showToast({
							icon: 'none',
							title: err[0][0]['Result']['ResponseStatus']['Errors'][0]['Message'],
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
				let params = {}
				if (this.keyword != null && this.keyword != '') {
					params = {
						data: {
							"FilterString": "FBillNo like '%" + this.keyword +
								"%' and FDocumentStatus ='C'",
							"FormId": "SAL_OUTSTOCK",
							"OrderString": "FBillNo ASC",
							"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FDate,FSaleOrgId.FNumber,FSaleOrgId.FName,FID,FNote",
							"Limit": "50"
						}
					}
				} else {
					params = {
						data: {
							"FilterString": "FDocumentStatus ='C' and FDate>= '" + this.start + "' and FDate <= '" + this.end + "'",
							"FormId": "SAL_OUTSTOCK",
							"OrderString": "FBillNo ASC",
							"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FDate,FSaleOrgId.FNumber,FSaleOrgId.FName,FID,FNote",
							"Limit": "50"
						}
					}
				}
				console.log(params)
				return params
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