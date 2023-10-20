<template>
	<view>
		<loading :loadModal="loadModal"></loading>
		<cu-custom bgColor="bg-gradual-gradient" class="customHead" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">装箱</block>
		</cu-custom>
		<uni-fab :pattern="pattern" :horizontal="horizontal" :vertical="vertical" cuIcon="scan" :popMenu="popMenu"
			distable :direction="direction" @fabClick="fabClick"></uni-fab>
		<view class="box getheight">
			<view class="cu-bar bg-white solid-bottom" style="height: auto;">
				<view class="action">
					<text>扫描:{{form.FBillNo}}</text>
				</view>
				<view class="action" v-if="form.FBillNo!=''">
					<text class="cuIcon-search" @tap="showModal"></text>
				</view>
				<view class="action">
					日期:
					<ruiDatePicker fields="day" class="ruidata" start="2010-00-00" end="2030-12-30" :value="form.fdate"
						@change="bindChange"></ruiDatePicker>
				</view>
			</view>
			<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
				<view class="action">
					<view class="title">备注:</view>
					<input name="input" @input='sumRemark' style="font-size: 13px;text-align: left;"
						v-model="form.fprocessnote" />
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="modalName=='Modal'?'show':''">
			<view class="cu-dialog" style="height: 70%;margin-top: 20%;">
				<view class="cu-bar bg-white justify-end" style="height: 60upx;">
					<view class="content">单据信息</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view style="height: 100%;overflow: auto;text-align: left;">
					<city-select @cityClick="cityClick" :formatName="formatName" :obtainCitys="toBeSelected"
						:isSearch="true" style="width: auto !important;" ref="citys"></city-select>
				</view>
			</view>
		</view>
		<scroll-view scroll-y class="page" :style="{ 'height': pageHeight + 'px' }">
			<uni-table border stripe emptyText="暂无更多数据">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th align="center">发货单号</uni-th>
					<uni-th align="center">物料名称</uni-th>
					<uni-th align="center">规格型号</uni-th>
					<uni-th align="center">单据数量</uni-th>
					<uni-th align="center">数量</uni-th>
					<uni-th align="center">装箱条码</uni-th>
					<uni-th align="center">装箱条码(大)</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="(item,index) in cuIList" :key="index">
					<uni-td align="center">{{item['fBillNo']}}</uni-td>
					<uni-td align="center">{{item['fName']}}</uni-td>
					<uni-td align="center">{{item['fSpecification']}}</uni-td>
					<uni-td align="center">{{item['fQty']}}</uni-td>
					<uni-td align="center">{{item['amount']}}</uni-td>
					<uni-td align="center">{{item['pickCode']}}</uni-td>
					<uni-td align="center">{{item['pickBigCode']}}</uni-td>
				</uni-tr>
			</uni-table>
			<view class="cu-bar tabbar shadow foot">
				<view class="box text-center btn-groups">
					<view>
						<button :disabled="isClick" class="cu-btn bg-green shadow-blur round lg" style="width: 40%;"
							@tap="packing">装箱</button>
						<button class="cu-btn bg-blue shadow-blur round lg" style="width: 40%;"
							@tap="$manyCk(printCode)">打印</button>
						<button :disabled="isClick" class="cu-btn margin-top bg-green shadow-blur round lg"
							style="width: 40%;" @tap="packingBig">装箱(大)</button>
						<button class="cu-btn bg-blue shadow-blur round lg" style="width: 40%;"
							@tap="$manyCk(printBigCode)">打印(大)</button>
					</view>
					<view class="sava-btn">
						<button :disabled="isClick" class="cu-btn bg-orange shadow-blur round lg" style="width: 100%;"
							@tap="$manyCk(saveData)"><text class="cuIcon-check"></text>提交</button>
					</view>
				</view>
			</view>
		</scroll-view>

	</view>
</template>
<script>
	import ruiDatePicker from '@/components/rattenking-dtpicker/rattenking-dtpicker.vue';
	import ldSelect from '@/components/ld-select/ld-select.vue'
	import uniFab from '@/components/uni-fab/uni-fab.vue';
	import basic from '@/api/basic';
	import citySelect from '@/components/city-select/city-select.vue';
	import workshop from '@/api/workshop';
	import service from '@/service.js';
	import loading from '@/components/loading';
	import {
		mapState
	} from 'vuex';
	var tsc = require("@/util/ble/tsc.js");
	var esc = require("@/util/ble/esc.js");
	var encode = require("@/util/ble/encoding.js");
	export default {
		components: {
			ruiDatePicker,
			ldSelect,
			uniFab,
			loading,
			citySelect
		},
		data() {
			return {
				paramsFid: 0,
				pageHeight: 0,
				headName: '',
				isOrder: false,
				onoff: true,
				isClick: false,
				loadModal: false,
				modalName: null,
				formatName: 'fName',
				form: {
					date: '',
					FBillNo: ''
				},
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
				toBeSelected: [],
				printRes: [],
				cuIList: [],
				endDate: null,
				sendContent: "",
				looptime: 0,
				printNumber: 0,
				currentTime: 1,
				lastData: 0,
				oneTimeData: 0,
				returnResult: "",
				canvasWidth: 180,
				canvasHeight: 180,
				imageSrc: '../../static/img/abc_ic_star_black_16dp.png',
				buffSize: [],
				buffIndex: 0,
				printNum: [],
				printNumIndex: 0,
				printerNum: 1,
				currentPrint: 1,
				isReceiptSend: false,
				isLabelSend: false
			};
		},
		computed: mapState(['sysinfo', 'Bluetooth']),
		onLoad: function(option) {
			let me = this
			me.isClick = false;
			if (JSON.stringify(option) != "{}") {
				this.isOrder = true
				var obj = JSON.parse(decodeURIComponent(option.obj))
				this.fetchData(obj[9])
				this.paramsFid = obj[9]
			}
		},
		onUnload() {
			let that = this;
			let {
				BLEInformation
			} = that.Bluetooth;
			uni.closeBLEConnection({
				deviceId: BLEInformation.deviceId,
				success: function(res) {
					console.log("关闭蓝牙成功")
				},
			})
		},
		onReady: function() {
			var me = this
			//me.loadModal = true
			if (service.getUsers().length > 0) {
				if (service.getUsers()[0].account != '' && service.getUsers()[0].account != "undefined") {
					me.form.fbillerID = service.getUsers()[0].userId
					me.form.username = service.getUsers()[0].username
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
								me.pageHeight = res.windowHeight - infoHeight - headHeight - 30
							}, 1000);
						}
					});
				}
			}
			let list = []
			let numList = []
			let j = 0
			for (let i = 20; i < 200; i += 10) {
				list[j] = i;
				j++
			}
			for (let i = 1; i < 10; i++) {
				numList[i - 1] = i
			}
			this.buffSize = list;
			this.oneTimeData = list[0];
			this.printNum = numList;
			this.printerNum = numList[0];

		},
		onShow() {
			let that = this;
			let width;
			let height;
			uni.getImageInfo({
				src: that.imageSrc,
				success(res) {
					console.log(res.width)
					console.log(res.height)
					width = res.width
					height = res.height
					that.canvasWidth = res.width;
					that.canvasHeight = res.height;
				}
			})
			const ctx = uni.createCanvasContext("edit_area_canvas", this);
			// if (app.globalData.platform == "android") {
			//   ctx.translate(width, height)
			//   ctx.rotate(180 * Math.PI / 180)
			// }
			ctx.drawImage(this.imageSrc, 0, 0, width, height);
			ctx.draw();
		},
		methods: {
			fetchData(id) {
				const me = this
				const obj = {
					pageSize: 50,
					pageNum: 1,
				}
				basic
					.executeBillQuery({
					data: {
						"FilterString": "FID =" + id +"",
						"FormId": "QDEP_Cust_PackInfo",
						"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
						"FieldKeys": "FBillNo,FCreateDate,FOutBillNo,FEntity_FEntryId,FMaterialID.FNumber,FMaterialID.FName,FQty,FBoxBarcode,FPackBarCode,FID,FSrcID,FSrcEntryID",
					}
				}).then(res => {
						let reso = res[0];
						if (res.length>0) {
							var beSelect=[]
							res.forEach((item, index) => {
								beSelect.push({
									fid: item[10],
									fEntryId: item[11],
									fName: item[5],
									fNumber: item[4],
									fQty: 0,
									fBillNo: item[2],
									fSpecification: "",
									amount: item[6],
									pickCode: item[7],
									pickBigCode: item[8],
								})
							})
							me.cuIList = [...beSelect]
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
			packing() {
				var printCode = new Date().getTime();
				for (var element in this.cuIList) {
					console.log(this.cuIList[element])
					if (this.cuIList[element]['pickCode'] == 0) {
						this.cuIList[element]['pickCode'] = printCode;
					}
				}
			},
			packingBig() {
				var code = 0;
				var printCode = new Date().getTime();
				for (var element in this.cuIList) {
					if (this.cuIList[element]['pickBigCode'] == 0) {
						this.cuIList[element]['pickBigCode'] = 'B' + '' + printCode;
					}
				}
				/* for (var element in this.cuIList) {
					if (code == 0) {
						if (this.cuIList[element]['pickBigCode'] == 0) {
							this.cuIList[element]['pickBigCode'] = 'B' + '' + new Date().getTime();
						} else {
							code = this.cuIList[element]['pickBigCode'];
							continue;
						}
					} else {
						this.cuIList[element]['pickBigCode'] = code;
					}
				} */
			},
			printCode() {
				let me = this;
				var printData = [];
				for (var item in this.cuIList) {
					if (printData.indexOf(this.cuIList[item]['pickCode']) == -1 && this.cuIList[item]['pickCode'] != 0) {
						printData.push(this.cuIList[item]['pickCode'])
					}
				}
				if (printData.length > 0) {
					uni.showModal({
						title: "提示",
						content: "是否立即打印",
						showCancel: true,
						cancelText: '取消',
						confirmText: '确定',
						success: res => {
							if (res.confirm) {
								me.printNumber = 0;
								let {
									BLEInformation
								} = me.Bluetooth;

								if (BLEInformation
									.deviceId == "") {
									// 用户点击确定
									setTimeout(
										function() {
											uni.navigateTo({
												url: '/pages/bleConnect/bleConnect?obj=' +
													encodeURIComponent(
														JSON
														.stringify(
															printData
														)
													)
											});
										}, 500)
								} else {
									me.printRes = printData
									me.bindViewTap();
								}
							}
						}
					})

				} else {
					uni.showToast({
						icon: 'none',
						title: '无打印数据',
					});
				}
			},
			printBigCode() {
				let me = this;
				var printData = [];
				for (var item in this.cuIList) {
					if (printData.indexOf(this.cuIList[item]['pickBigCode']) == -1 && this.cuIList[item]['pickBigCode'] !=
						0) {
						printData.push(this.cuIList[item]['pickBigCode'])
					}
				}
				if (printData.length > 0) {
					uni.showModal({
						title: "提示",
						content: "是否立即打印",
						showCancel: true,
						cancelText: '取消',
						confirmText: '确定',
						success: res => {
							if (res.confirm) {
								me.printNumber = 0;
								let {
									BLEInformation
								} = me.Bluetooth;
								me.form.fdate = me.getDay('', 0).date
								me.form.entry = me.cuIList
								if (BLEInformation
									.deviceId == "") {
									// 用户点击确定
									setTimeout(
										function() {
											uni.navigateTo({
												url: '/pages/bleConnect/bleConnect?obj=' +
													encodeURIComponent(
														JSON
														.stringify(
															printData
														)
													)
											});
										}, 500)
								} else {
									me.printRes = printData
									me.bindViewTap();
								}
							}
						}
					})
				} else {
					uni.showToast({
						icon: 'none',
						title: '无打印数据',
					});
				}

			},
			sumRemark(val) {
				this.form.fprocessnote = val.detail.value;
			},
			cityClick(item) {
				console.log(item)
				this.cuIList.push({...item})
				this.modalName = null
			},
			clearList() {
				const that = this
				if (that.cuIList.length > 0) {
					uni.showModal({
						title: '温馨提示',
						content: '是否清空列表，清空之后将无法还原！',
						success: function(res) {
							if (res.confirm) {
								that.cuIList = []
								that.initMain()
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					});
				}
			},
			async saveData() {
				this.isClick = true
				let list = this.cuIList
				let that = this
				let paramData = []
				let orderParams = []
				var number = 0;
				for (var element in list) {
					if(orderParams.indexOf(list[element]['fid'])==-1){
						//提交单据次数
						orderParams.push(list[element]['fid'])
					}
					if (list[element]['pickCode'] == 0 || list[element]['pickBigCode'] == 0) {
						number++;
						break;
					} else {
						paramData.push({
							"FOutBillNo": list[element]['fBillNo'],
							"FMaterialID": {
								"FNUMBER": list[element]['fNumber']
							},
							"FQty": list[element]['amount'],
							"FBoxBarcode": list[element]['pickCode'],
							"FPackBarCode": list[element]['pickBigCode'],
							"FSrcID": list[element]['fid'],
							"FSrcEntryID ": list[element]['fEntryId'],
							//"FMarerialSpec": list[element]['fSpecification'],
						})
					}
				}
				if (number > 0) {
					that.isClick = false
					return uni.showToast({
						icon: 'none',
						title: '装箱未完成',
					});
				}
				uni.showNavigationBarLoading();
				basic
					.kdSave({
						"formid": "QDEP_Cust_PackInfo",
						"data": {
							"NeedUpDataFields": ["FEntity"],
							"NeedReturnFields": ["FEntity"],
							"IsDeleteEntry": true,
							"Model": {
								"FID": that.paramsFid,
								"FEntity": paramData
							},
						}
					}).then(saveRes => {
						let saveReso = saveRes[0];
						if (saveRes['Result']['ResponseStatus']['IsSuccess']) {
							console.log(orderParams)
							for(var item in orderParams){
								basic.unAudit({
										"formid": "SAL_OUTSTOCK",
										"data": {
											"Ids": orderParams[item],
										},
									}).then(unAuditRes => {
										let unAuditReso = unAuditRes[0];
										if (unAuditRes != null && unAuditRes['Result']['ResponseStatus'][
												'IsSuccess'
											]) {
											//保存
											basic.kdSave({
												"formid": "SAL_OUTSTOCK",
												"data": {
													"NeedUpDataFields": ["FEntity"],
													"NeedReturnFields": ["FEntity"],
													"IsDeleteEntry": false,
													"Model": {
														"FID": orderParams[item],
														"FOutStatus": "待收货",
													},
												}
											}).then(
												keepRes => {
													let keepReso = keepRes[0];
													if (keepRes != null && keepRes['Result'][
															'ResponseStatus'
														]['IsSuccess']) {
														//提交
														basic.kdSubmit({
															"formid": "SAL_OUTSTOCK",
															"data": {
																"Ids": orderParams[item],
															},
														}).then(submitRes => {
															let submitReso = submitRes[0];
															if (submitRes != null && submitRes['Result'][
																	'ResponseStatus'
																]['IsSuccess']) {
																//审核
																basic.kdAudit({
																	"formid": "SAL_OUTSTOCK",
																	"data": {
																		"Ids": orderParams[item],
																	},
																}).then(
																	auditRes => {
																		let auditReso = auditRes[0];
																		if (auditRes != null && auditRes['Result'][
																				'ResponseStatus'
																			]['IsSuccess']) {
																			if(item+1==orderParams.length){
																				uni.hideNavigationBarLoading();
																				uni.showToast({
																					title: "保存成功",
																					icon: 'success',
																					duration: 2000,
																					mask: true,
																					success: function() {
																						setTimeout(function() {
																							//要延时执行的代码
																							uni.navigateBack();
																						}, 2000) //延迟时间
																					}
																				});
																			}
																		} else {
																			this.isClick = false
																			uni.hideNavigationBarLoading();
																			uni.showToast({
																				icon: 'none',
																				title: auditRes[
																						'Result'
																					]
																					[
																						'ResponseStatus'
																					]
																					[
																						'Errors'
																					]
																					[
																						0
																					]
																					[
																						'Message'
																					]
																			})
																		}
																	});
															} else {
																this.isClick = false
																uni.hideNavigationBarLoading();
																uni.showToast({
																	icon: 'none',
																	title: submitRes[
																			'Result'
																		][
																			'ResponseStatus'
																		][
																			'Errors'
																		]
																		[0][
																			'Message'
																		]
																})
															}
														});
								
													} else {
														this.isClick = false
														uni.hideNavigationBarLoading();
														uni.showToast({
															icon: 'none',
															title: keepRes[
																	'Result'
																]
																[
																	'ResponseStatus'
																]
																[
																	'Errors'
																]
																[
																	0
																]
																[
																	'Message'
																]
														})
													}
												});
										} else {
											this.isClick = false
											uni.hideNavigationBarLoading();
											uni.showToast({
												icon: 'none',
												title: unAuditRes['Result'][
													'ResponseStatus'
												]['Errors'][0]['Message']
											})
										}
									});
								
							}
							
						} else {
							this.isClick = false
							uni.hideNavigationBarLoading();
							uni.showToast({
								icon: 'none',
								title: saveRes['Result']['ResponseStatus']['Errors'][0]['Message']
							})
						}
					});
			},
			showModal(index, item) {
				this.modalName = 'Modal'
			},
			hideModal(e) {
				this.modalName = null
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
			bindChange(e) {
				this.form.fdate = e
			},
			fabClick() {
				var that = this
				uni.scanCode({
					success: function(res) {
						basic
							.executeBillQuery({
								data: {
									"FilterString": "FBillNo like '%" + res.result + "%'",
									"FormId": "SAL_OUTSTOCK",
									"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
									"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID",
								}
							}).then(resPoll => {
								let reso = resPoll[0];
								console.log(resPoll)
								if (resPoll.length > 0) {
									that.form.FBillNo = res.result
									var beSelect = []
									resPoll.forEach((item, index) => {
										beSelect.push({
											fid: item[14],
											fEntryId: item[4],
											fName: item[6],
											fNumber: item[5],
											fQty: item[12],
											fBillNo: item[0],
											fSpecification: item[7],
											amount: 1,
											pickCode: 0,
											pickBigCode: 0,
										})
									})
									that.toBeSelected = [...beSelect]
									that.showModal();
								} else {
									uni.showToast({
										icon: 'none',
										title: reso[0]['Result']['ResponseStatus']['Errors'][0][
											'Message'
										]
									})
								}
							}).catch(err => {
								uni.showToast({
									icon: 'none',
									title: err[0][0]['Result']['ResponseStatus']['Errors'][0][
										'Message'
									],
								});
							})
					}
				});
			},
			//绑定蓝牙
			bindViewTap(e) {
				let that = this;
				let {
					BLEInformation
				} = that.Bluetooth;
				let
					title = BLEInformation.deviceId;
				that.serviceId = 0;
				that.writeCharacter = false;
				that.readCharacter = false;
				that.notifyCharacter = false;
				uni.showLoading({
					title: '正在连接',
				})
				console.log('deviceId:', title)
				// uni.createBLEConnection
				plus.bluetooth.createBLEConnection({
					deviceId: title,
					success(res) {
						console.log('createBLEConnection success:', res)
						BLEInformation.deviceId = title;
						uni.hideLoading()
						that.getSeviceId()
					},
					fail(e) {
						console.log('createBLEConnection error:', e)
						uni.hideLoading()
						if(e.message =="already connect"){
							BLEInformation.deviceId = title;
							that.getSeviceId()
						}else{
							that.errorCodeTip(e.errCode);
							uni.navigateTo({
								url: '/pages/bleConnect/bleConnect?obj=' +
									encodeURIComponent(
										JSON
										.stringify(
											that
											.printRes
										))
							});
						}
					}
				})
			},
			//获取蓝牙设备所有服务(service)。
			getSeviceId() {
				let that = this;
				let {
					BLEInformation
				} = that.Bluetooth;
				console.log('BLEInformation.deviceId:', BLEInformation.deviceId)
				// uni.getBLEDeviceServices
				let t = setTimeout(() => {
					plus.bluetooth.getBLEDeviceServices({
						deviceId: BLEInformation.deviceId,
						success(res) {
							console.log('getBLEDeviceServices success:', res)
							that.services = res.services;
							that.getCharacteristics()
						},
						fail: function(e) {
							that.errorCodeTip(e.code);
							console.log('getBLEDeviceServices fail:', e)
							uni.navigateTo({
								url: '/pages/bleConnect/bleConnect?obj=' +
									encodeURIComponent(
										JSON
										.stringify(
											that
											.printRes
										))
							});
						}
					})
					clearTimeout(t);
				}, 1500)
			},
			//错误码提示
			errorCodeTip(code) {
				if (code == 0) {
					//正常
				} else if (code == 10000) {
					uni.showToast({
						title: '未初始化蓝牙适配器',
						icon: 'none'
					})
				} else if (code == 10001) {
					uni.showToast({
						title: '当前蓝牙适配器不可用',
						icon: 'none'
					})
				} else if (code == 10002) {
					uni.showToast({
						title: '没有找到指定设备',
						icon: 'none'
					})
				} else if (code == 10003) {
					uni.showToast({
						title: '连接失败',
						icon: 'none'
					})
				} else if (code == 10004) {
					uni.showToast({
						title: '没有找到指定服务',
						icon: 'none'
					})
				} else if (code == 10005) {
					uni.showToast({
						title: '没有找到指定特征值',
						icon: 'none'
					})
				} else if (code == 10006) {
					uni.showToast({
						title: '当前连接已断开',
						icon: 'none'
					})
				} else if (code == 10007) {
					uni.showToast({
						title: '当前特征值不支持此操作',
						icon: 'none'
					})
				} else if (code == 10008) {
					uni.showToast({
						title: '其余所有系统上报的异常',
						icon: 'none'
					})
				} else if (code == 10009) {
					uni.showToast({
						title: 'Android 系统特有，系统版本低于 4.3 不支持 BLE',
						icon: 'none'
					})
				}
			},
			getCharacteristics() {
				var that = this
				let {
					services: list,
					serviceId: num,
					writeCharacter: write,
					readCharacter: read,
					notifyCharacter: notify
				} = that;
				let {
					BLEInformation
				} = that.Bluetooth;
				// uni.getBLEDeviceCharacteristics
				plus.bluetooth.getBLEDeviceCharacteristics({
					deviceId: BLEInformation.deviceId,
					serviceId: list[num].uuid,
					success(res) {
						console.log(res)
						for (var i = 0; i < res.characteristics.length; ++i) {
							var properties = res.characteristics[i].properties
							var item = res.characteristics[i].uuid
							if (!notify) {
								if (properties.notify) {
									BLEInformation.notifyCharaterId = item;
									BLEInformation.notifyServiceId = list[num].uuid;
									that.$store.commit('BLEInformationSet', BLEInformation);
									notify = true
								}
							}
							if (!write) {
								if (properties.write) {
									BLEInformation.writeCharaterId = item;
									BLEInformation.writeServiceId = list[num].uuid;
									that.$store.commit('BLEInformationSet', BLEInformation);
									write = true
								}
							}
							if (!read) {
								if (properties.read) {
									BLEInformation.readCharaterId = item;
									BLEInformation.readServiceId = list[num].uuid;
									that.$store.commit('BLEInformationSet', BLEInformation);
									read = true
								}
							}
						}
						if (!write || !notify || !read) {
							num++
							that.writeCharacter = write;
							that.readCharacter = read;
							that.notifyCharacter = notify;
							that.serviceId = num;
							if (num == list.length) {
								uni.showModal({
									title: '提示',
									content: '找不到该读写的特征值',
								})
							} else {
								that.getCharacteristics()
							}
						} else {
							that.openControl()
						}
					},
					fail: function(e) {
						console.log("getBLEDeviceCharacteristics fail：", e);
						that.errorCodeTip(e.errCode);
					}
				})
			},
			openControl: function() {
				let that = this;
				for (let i = 0; i < that.printRes.length; i++) {
					if (i == 0) {
						that.labelTest(that.printRes[i]);
					} else {
						(function(t, data) { // 注意这里是形参
							setTimeout(function() {
								that.labelTest(that.printRes[i]);
							}, 3000 * t); // 还是每秒执行一次，不是累加的
						})(i, '') // 
					}

				}
				/* uni.$emit('handleBack', {
					startDate: that.startDate,
					endDate: that.endDate
				}); */

				/* uni.navigateTo({
					url: '/pages/sendCommand/sendCommand',
				}) */
			},
			//标签打印
			labelTest(item) {
				console.log("打印")
				console.log(item)
				let that = this;
				let canvasWidth = that.canvasWidth
				let canvasHeight = that.canvasHeight
				let command = tsc.jpPrinter.createNew()
				command.setSize(80, 60)
				command.setGap(0)
				command.setCls()
				command.setQR(190, 150, "L", 8, "A", item)
				command.setPagePrint();
				that.isLabelSend = true;
				that.prepareSend(command.getData(), item)
			},
			//准备发送，根据每次发送字节数来处理分包数量
			prepareSend(buff, item) {
				console.log(buff);
				let that = this
				let time = that.oneTimeData
				let looptime = parseInt(buff.length / time);
				let lastData = parseInt(buff.length % time);
				console.log(looptime + "---" + lastData)
				this.looptime = looptime + 1;
				this.lastData = lastData;
				this.currentTime = 1;
				that.Send(buff, item)
			},
			//分包发送
			Send(buff, item) {
				let that = this
				let {
					currentTime,
					looptime: loopTime,
					lastData,
					oneTimeData: onTimeData,
					printerNum: printNum,
					currentPrint
				} = that;
				let buf;
				let dataView;
				if (currentTime < loopTime) {
					buf = new ArrayBuffer(onTimeData)
					dataView = new DataView(buf)
					for (var i = 0; i < onTimeData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
					}
				} else {
					buf = new ArrayBuffer(lastData)
					dataView = new DataView(buf)
					for (var i = 0; i < lastData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
					}
				}
				console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
				let {
					BLEInformation
				} = that.Bluetooth;
				plus.bluetooth.writeBLECharacteristicValue({
					deviceId: BLEInformation.deviceId,
					serviceId: BLEInformation.writeServiceId,
					characteristicId: BLEInformation.writeCharaterId,
					value: buf,
					success: function(res) {
						console.log(res)
					},
					fail: function(e) {
						console.log(e)
					},
					complete: function() {
						currentTime++
						if (currentTime <= loopTime) {
							that.currentTime = currentTime;
							that.Send(buff, item)
						} else {
							that.printNumber++;
							uni.showToast({
								title: '已打印第' + currentPrint + '张',
							})
							console.log(that.printNumber + "," + that.printRes.length)
							/* if (that.printNumber == that.printRes.length) {
								uni.navigateBack();
							} */
							if (currentPrint == printNum) {
								that.looptime = 0;
								that.lastData = 0;
								that.currentTime = 1;
								that.isReceiptSend = false;
								that.isLabelSend = false;
								that.currentPrint = 1;
							} else {
								currentPrint++;
								that.currentPrint = currentPrint;
								that.currentTime = 1;
								that.Send(buff, item)
							}
						}
					}
				})
			},
		}
	}
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

	.btn-groups {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}

	.sava-btn {
		height: 200rpx;
		line-height: 200rpx;
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