<template>
	<view>
		<loading :loadModal="loadModal"></loading>
		<cu-custom bgColor="bg-gradual-blue" class="customHead" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">汇报</block>
		</cu-custom>
		<!-- <uni-fab
	    :pattern="pattern"
	    :horizontal="horizontal"
		:vertical="vertical"
		cuIcon="add"
		:popMenu="popMenu"
		distable
		:direction="direction"
		 @fabClick="fabClick"
		 ></uni-fab> -->
		<view class="box getheight">
			<!-- <view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action">
				单号:<text>{{form.workNo}}</text>
			</view>
			<view class="action">
				卡号:<text>{{form.processCard}}</text>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action">
				金蝶号:<text>{{form.kingDeeNo}}</text>
			</view>
			<view class="action">
				生产批次:<text>{{form.lotNo}}</text>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action">
				产品编码:<text>{{form.productName}}</text>
			</view>
			<view class="action">
				产品名称:<text>{{form.productNumber}}</text>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action">
				规格型号:<text>{{form.model}}</text>
			</view>
			<view class="action">
				计划量:<text>{{form.planNum}}</text>
			</view>
		</view><view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action">
				派工数量:<text>{{form.dispatchNum}}</text>
			</view>
			
		</view> -->
		</view>
		<view class="cu-modal" :class="modalName == 'Modal' ? 'show' : ''">
			<view class="cu-dialog" style="height: 70%;margin-top: 20%;">
				<view class="cu-bar bg-white justify-end" style="height: 60upx;">
					<view class="content">人员信息</view>
					<view class="action" @tap="hideModal"><text class="cuIcon-close text-red"></text></view>
				</view>
				<view style="height: 100%;overflow: auto;text-align: left;">
					<city-select @cityClick="cityClick" :formatName="formatName" :obtainCitys="empList" :isSearch="true"
						style="width: auto !important;" ref="citys"></city-select>
				</view>
			</view>
		</view>
		<scroll-view scroll-y class="page" :style="{ height: pageHeight + 'px' }">
			<view v-for="(item, index) in cuIList" :key="index">
				<view class="cu-list menu-avatar">
					<view class="cu-item" style="width: 100%;padding:15rpx 0 15rpx 0;height: auto;"
						:class="modalName == 'move-box-' + index ? 'move-cur' : ''" :data-target="'move-box-' + index">
						<!-- @touchstart="ListTouchStart"
						@touchmove="ListTouchMove" @touchend="ListTouchEnd" -->
						<view style="clear: both;width: 100%;" class="grid  col-2">
							<!-- <view style="width: 100%;">
								<view class="text-grey">
									<button class="cu-btn sm round bg-green shadow" @tap="showModal(index, item)" :disabled="isDis" data-target="Modal">
									<text class="cuIcon-people">
									</text>人员:{{item.userName}}</button>
								</view>
							</view> -->
							<view class="text-grey">产品编码:{{ item.FItemNumber }}</view>
							<view class="text-grey" style="width: 100%;">产品名称:{{ item.FItemName }}</view>
							<view class="text-grey">规格型号:{{ item.FModel }}</view>
							<view class="text-grey">工序序号:{{ item.FOrderNo }}</view>
							<view class="text-grey">工序代码:{{ item.FAlternateNumber }}</view>
							<view class="text-grey">工序名称:{{ item.FAlternateName }}</view>
							<view class="text-grey">汇报状态:{{ item.FReportStatus }}</view>
							<view class="text-grey">派工数量:{{ item.FWBSentNum }}</view>
							<view class="text-grey">已汇报数量:{{ item.FRepQty }}</view>
							<view class="text-grey">
								未汇报数量:{{item.FWBSentNum-item.FRepQty <0 ? '0':  item.FWBSentNum-item.FRepQty}}</view>
							<view>
								<view style="float: left;line-height: 70upx;">开工时间:</view>
								<ruiDatePicker fields="day" class='ruidata' start="2010-00-00" end="2030-12-30"
									:value="item.FDate.substring(0, 10)" @change="bindChange1($event,item)">
								</ruiDatePicker>
							</view>
							<view>
								<view style="float: left;line-height: 70upx;">完工时间:</view>
								<ruiDatePicker fields="day" class='ruidata' start="2010-00-00" end="2030-12-30"
									@change="bindChange2($event,item)"></ruiDatePicker>
							</view>
							<view style="line-height: 70upx;">
								<button class="cu-btn sm round bg-green shadow" @tap="showModal(index, item)"
									:disabled="isDis" data-target="Modal">
									<text class="cuIcon-people">
									</text>汇报人员:{{item.userName}}</button>
							</view>
							<view>
								<view style="float: left;line-height: 70upx;">实作数量:</view>
								<input name="input" type="digit" @input="checkBlur1($event,item)"
									style="border-bottom: 1px solid;" v-model="item.FProcessQty" />
								<!-- :focus="firstFocus" -->
							</view>
							<view>
								<view style="float: left;line-height: 70upx;">合格数量:</view>
								<input name="input" type="digit" @input="checkBlur2($event,item)"
									style="border-bottom: 1px solid;" v-model="item.FOKQty" />
							</view>
							<view>
								<view style="float: left;line-height: 70upx;">不合格数量:</view>
								<input name="input" type="digit" @input="checkBlur3($event,item)"
									style="border-bottom: 1px solid;" v-model="item.FFailQty" />
							</view>
						</view>
						<!-- <view class="move">
							<view class="bg-red" @tap="del(index, item)">删除</view>
						</view> -->
					</view>
				</view>
			</view>
			<view class="cu-bar tabbar shadow foot">
				<view class="box text-center">
					<button :disabled="isClick" class="cu-btn bg-green shadow-blur round lg" style="width: 40%;"
						@tap="$manyCk(saveData)">提交</button>
					<!-- <button class="cu-btn bg-blue shadow-blur round lg" style="width: 40%;" @tap="$manyCk(clearList)">清空</button> -->
				</view>
			</view>
		</scroll-view>
	</view>
</template>
<script>
	import ruiDatePicker from '@/components/rattenking-dtpicker/rattenking-dtpicker.vue';
	import ldSelect from '@/components/ld-select/ld-select.vue';
	import uniFab from '@/components/uni-fab/uni-fab.vue';
	import basic from '@/api/basic';
	import workshop from '@/api/workshop';
	import service from '@/service.js';
	import loading from '@/components/loading';
	export default {
		components: {
			ruiDatePicker,
			ldSelect,
			uniFab,
			loading
		},
		data() {
			return {
				formatName: 'FName',
				pageHeight: 0,
				headName: '',
				start: '',
				isOrder: false,
				loadModal: false,
				onoff: true,
				isDis: false,
				isClick: false,
				pickerVal: null,
				gridCol: 3,
				modalName: null,
				form: {
					dispatchNum: '',
					kingDeeNo: '',
					lotNo: '',
					model: '',
					planNum: '',
					processCard: '',
					productWorkDetailId: '',
					workNo: ''
				},
				skin: false,
				listTouchStart: 0,
				listTouchDirection: null,
				empList: [],
				horizontal: 'right',
				vertical: 'bottom',
				popMenu: false,
				firstFocus: true,
				direction: 'horizontal',
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF'
				},
				cuIList: [{}],
				startDate: null,
				endDate: null
			};
		},
		onHide() {
			// 移除监听事件
			uni.$off('scancodedate');
		},
		onShow: function(option) {
			let that = this;
			uni.$on('scancodedate', function(data) {
				// _this 这里面的方法用这个 _this.code(data.code)
				that.empList.forEach((item) => {
					if (item.FNumber == data.code) {
						that.$set(that.cuIList[0], 'userName', item.FName);
						that.$set(that.cuIList[0], 'userId', item.FNumber);
						uni.setStorageSync('userName', item.FName);
						uni.setStorageSync('userId', item.FNumber);
					}
				})
				/* 
				that.$set(that.cuIList[0],'fopernumber',code[0])
				that.$set(that.cuIList[0],'username',code[1]) */
			});
		},
		onLoad: function(option) {
			let me = this;
			let list = JSON.parse(option.cutList);
			me.isClick = false;
			if (JSON.stringify(option) != '{}') {
				this.isOrder = true;
				if (Number(list.FWBSentNum) - Number(list.FRepQty) > 0) {
					list.FProcessQty = Number(list.FWBSentNum) - Number(list.FRepQty)
					list.FUnRepQty = Number(list.FWBSentNum) - Number(list.FRepQty)
				} else {
					list.FProcessQty = 0
					list.FUnRepQty = 0
				}
				list.FOKQty = list.FUnRepQty
				list.FFailQty = list.FProcessQty - list.FOKQty
				/* {{item.FWBSentNum-item.FRepQty <0 ? '0':  item.FWBSentNum-item.FRepQty}} */
				this.cuIList = [list];
				this.$set(this.cuIList[0], 'userName', uni.getStorageSync('userName'));
				this.$set(this.cuIList[0], 'userId', uni.getStorageSync('userId'));
				me.startDate = option.startDate;
				me.endDate = option.endDate;
				/* list.forEach((item,index) =>{
							 me.form.kingDeeNo = option.kingDeeNo
							  me.form.productWorkDetailId = option.productWorkDetailId 
							  me.form.lotNo = option.lotNo 
							  me.form.model = option.model 
							  me.form.planNum = option.planNum 
							  me.form.processCard = option.processCard 
							  me.form.productName = option.productName 
							  me.form.productNumber = option.productNumber 
							  me.form.workNo = option.workNo 
							 
						 }) */
			}
		},
		onReady: function() {
			var me = this;
			me.loadModal = true;
			if (service.getUsers().length > 0) {
				if (service.getUsers()[0].account != '' && service.getUsers()[0].account != 'undefined') {
					me.form.fbillerID = service.getUsers()[0].userId;
					me.form.username = service.getUsers()[0].username;
					uni.getSystemInfo({
						success: function(res) {
							// res - 各种参数
							let info = uni.createSelectorQuery().select('.getheight');
							let customHead = uni.createSelectorQuery().select('.customHead');
							var infoHeight = 0;
							var headHeight = 0;
							info.boundingClientRect(function(data) {
								//data - 各种参数
								infoHeight = data.height;
							}).exec();
							customHead
								.boundingClientRect(function(data) {
									//data - 各种参数
									headHeight = data.height;
								})
								.exec();
							setTimeout(function() {
								me.pageHeight = res.windowHeight - infoHeight - headHeight;
							}, 1000);
						}
					});
					me.initMain();
				}
			}
		},
		methods: {
			bindChange1(event, item) {
				item.FWorkStartDate = event
			},
			bindChange2(event, item) {
				item.FWorkEndDate = event
			},
			checkBlur1(event, item) {
				let me = this
				if (Number(event.target.value) + item.FRepQty > item.FWBSentNum + item.FWBSentNum * 0.1) {
					me.$nextTick(function() {
						me.$set(item, 'FProcessQty', 0);
						me.$set(item, 'FOKQty', 0);
						item.FProcessQty = 0;
						item.FOKQty = 0;
					});
					return uni.showToast({
						icon: 'none',
						title: '汇报数量不能超出派工数量10%'
					});
				}
				me.$nextTick(function() {
					me.$set(item, 'FOKQty', event.target.value);
					me.$set(item, 'FFailQty', item.FProcessQty - item.FOKQty);
				});

			},
			checkBlur2(event, item) {
				let me = this
				if (Number(event.target.value) > Number(item['FProcessQty'])) {
					me.$nextTick(function() {
					me.$set(item, 'FOKQty', 0);
					});
					return uni.showToast({
						icon: 'none',
						title: '合格数量不能大于实作数量'
					});
				}
				me.$nextTick(function() {
					me.$set(item, 'FFailQty', item.FProcessQty - event.target.value);
				});
			},
			checkBlur3(event, item) {
				let me = this
				if (Number(event.target.value) > Number(item['FProcessQty'])) {
					me.$nextTick(function() {
					me.$set(item, 'FFailQty', 0);
					});
					return uni.showToast({
						icon: 'none',
						title: '不合格数量不能大于实作数量'
					});
				}
				me.$nextTick(function() {
					me.$set(item, 'FOKQty', item.FProcessQty - event.target.value);
				});
			},
			cityClick(item) {
				this.$set(this.popupForm, 'userName', item.FName);
				this.$set(this.popupForm, 'userId', item.FItemID);
				uni.setStorageSync('userName', item.FName);
				uni.setStorageSync('userId', item.FNumber);
				this.modalName = null;
			},
			showModal(index, item) {
				this.modalName = 'Modal';
				this.popupForm = item;
			},
			hideModal(e) {
				this.modalName = null;
			},
			clearList() {
				const that = this;
				if (that.cuIList.length > 0) {
					uni.showModal({
						title: '温馨提示',
						content: '是否清空列表，清空之后将无法还原！',
						success: function(res) {
							if (res.confirm) {
								that.cuIList = [];
								that.initMain();
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					});
				}
			},
			initMain() {
				const me = this;
				this.form.fdate = this.getDay('', 0).date;
				basic
					.getEmpList({})
					.then(res => {
						if (res.success) {
							me.empList = res.data;
						}
					})
					.catch(err => {
						uni.showToast({
							icon: 'none',
							title: err.msg
						});
					});
				me.loadModal = false;
				me.isClick = false;
			},
			saveData() {
				this.isClick = true;
				let portData = {};
				let result = [];
				let list = this.cuIList;
				let array = [];
				let me = this;
				if (list[0].FWBSentNum > 0) {
					basic
						.getBillNo({
							TranType: 1002588
						})
						.then(reso => {
							if (reso.success) {
								for (let i in list) {
									let obj = {};
									if (list[i].FProcessQty == null || typeof list[i].FProcessQty == '' || list[i]
										.FProcessQty == 0) {
										result.push(list[i].index);
									}
									if (list[i].FOKQty == null || typeof list[i].FOKQty == '') {
										result.push(list[i].index);
									}
									if (list[i].FFailQty == null || typeof list[i].FFailQty == '') {
										result.push(list[i].index);
									}
									if ((Number(list[i].FOKQty) + Number(list[i].FFailQty)) == 0) {
										result.push(list[i].index);
									}
									obj.fbillno = reso.data;
									obj.fentryid = 0;
									obj.fworkorderno = list[i].FBillNo;
									obj.fworkorderentryid = list[i].FEntryID;
									obj.fprocessqty = list[i].FProcessQty;
									obj.fokqty = list[i].FOKQty;
									obj.ffailqty = list[i].FFailQty;
									obj.fopernumber = list[i].userId;
									array.push(obj);
								}
								if (result.length > 0) {
									me.isClick = false
									return uni.showToast({
										icon: 'none',
										title: '数量输入有误，请检查',
									});
								}
								if ((list[0].FWBSentNum - list[0].FRepQty) > 0) {
									portData.ftrantype = 1002588;
									portData.foper = 'N';
									portData.finterid = 0;
									portData.fdate = me.form.fdate;
									portData.fbillno = reso.data;
									portData.fworkorderno = list[0].FBillNo;
									portData.fplanbillno = list[0].FProduceTaskNo;
									portData.fworkstartdate = list[0].FWorkStartDate;
									portData.fworkenddate = list[0].FWorkEndDate;
									portData.fitemnumber = list[0].FItemNumber;
									portData.forderno = list[0].FOrderNo;
									// portData.fopernumber = list[0].userId;
									portData.fbiller = service.getUsers()[0].account
									portData.fwbnumber = list[0].FAlternateNumber;
									portData.repEntry = array;
									if (array.length > 0) {
										workshop
											.productWorkInsert(portData)
											.then(res => {
												if (res.success) {
													me.cuIList = [];
													uni.showToast({
														icon: 'success',
														title: res.msg
													});
													me.initMain();
													if (me.isOrder) {
														setTimeout(function() {
															uni.$emit('handleBack', {
																startDate: me.startDate,
																endDate: me.endDate
															});
															uni.navigateBack({
																url: '../workshop/report'
															});
														}, 500);
													}
												}
											})
											.catch(err => {
												uni.showToast({
													icon: 'none',
													title: err.message
												});
												me.isClick = false;
											});
									} else {
										uni.showToast({
											icon: 'none',
											title: '请填写汇报'
										});
										me.isClick = false;
									}
								} else {
									return uni.showToast({
										icon: 'none',
										title: '可汇报数为零',
									});
								}
							}
						})
						.catch(err => {
							uni.showToast({
								icon: 'none',
								title: err.msg
							});
						});
				} else {
					return uni.showToast({
						icon: 'none',
						title: '可汇报数量为0',
					});
				}
			},
			del(index, item) {
				this.cuIList.splice(index, 1);
				this.form.bNum = this.cuIList.length;
			},
			// 查询前后三天日期
			getDay(date, day) {
				var today = new Date();
				var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
				today.setTime(targetday_milliseconds); //注意，这行是关键代码
				var tYear = today.getFullYear();
				var tMonth = today.getMonth();
				var tDate = today.getDate();
				var getDay = today.getDay();
				tMonth = this.doHandleMonth(tMonth + 1);
				tDate = this.doHandleMonth(tDate);
				var weeks = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
				var week = weeks[getDay];
				return {
					day: tDate,
					week: week,
					date: tYear + '-' + tMonth + '-' + tDate
				};
			},
			doHandleMonth(month) {
				var m = month;
				if (month.toString().length == 1) {
					m = '0' + month;
				}
				return m;
			},
			PickerChange(e, item) {
				this.$set(item, 'userName', this.empList[e.detail.value].FName);
				this.$set(item, 'userId', this.empList[e.detail.value].FItemID);
			},
			fabClick() {
				var that = this;
				that.cuIList.push({
					userId: null,
					dispatchNum: 0,
					qualifiedNum: 0
				});
			}, // ListTouch触摸开始
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX;
			},

			// ListTouch计算方向
			ListTouchMove(e) {
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left';
			},

			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target;
				} else {
					this.modalName = null;
				}
				this.listTouchDirection = null;
			}
		}
	};
</script>

<style>
	.cu-item {
		float: left;
		width: 50%;
	}

	.cu-item .content {
		float: left;
	}

	.cu-list.menu-avatar>.cu-item .content {
		left: 5px;
	}

	.cu-list.menu-avatar>.cu-item .action {}

	.input {
		height: 30px;
	}

	.box {
		width: 100%;
	}

	.uni-input-placeholder,
	.uni-input-input {
		font-size: 13px;
	}

	.action,
	.content {
		font-size: 13px !important;
	}

	.ruidata {
		font-size: 13px;
		height: 7vw !important;
	}

	.cu-bar {
		min-height: 30px;
	}

	/* .page {
		height: calc(100vh - 320upx);
	} */
	.nav-title::first-letter {
		font-size: 16px;
		margin-right: 2px;
	}
</style>
