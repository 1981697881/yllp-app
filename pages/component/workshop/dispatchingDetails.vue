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
		<view class="cu-modal show" v-if="modalName=='Modal'" ><!-- :class="modalName=='Modal'?'show':''" -->
			<view class="cu-dialog" style="height: 80%;margin-top: 20%;">
				<view class="cu-bar bg-white justify-between" style="height: 90upx;">
					<view class="action" @tap="comfirmData">
						<text class="cuIcon-check text-red"></text>
					</view>
					<view class="title">单据信息</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view style="height: 90%;overflow: auto;text-align: left;">
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
					<uni-td align="center"><input type="number" :value="item['amount']" @input="textInput($event,item)" placeholder="请输入"/></uni-td>
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
							@tap="$manyCk(printCode)" :disabled='btn_disabled'>打印</button>
						<button :disabled="isClick" class="cu-btn margin-top bg-green shadow-blur round lg"
							style="width: 40%;" @tap="packingBig">装箱(大)</button>
						<button class="cu-btn bg-blue shadow-blur round lg" style="width: 40%;"
							@tap="$manyCk(printBigCode)" :disabled='btn_disabled'>打印(大)</button>
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
	const app = getApp()
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
	/* var tsc = require("@/util/ble/tsc.js");
	var esc = require("@/util/ble/esc.js");
	var encode = require("@/util/ble/encoding.js"); */
	import * as zksdk from '@/util/bluetoolth';
	var util = require("../../../util/util.js");
	var gbk = require('../../../util/printUtil-GBK.js');
	var pako = require('../../../util/pako/index.js');
	var recArrayBuff = new ArrayBuffer(256);
	var recLen = 0;
	const errMsg = {
		10000: '未初始化蓝牙模块',
		10001: '蓝牙未打开',
		10002: '没有找到指定设备',
		10003: '连接失败',
		10004: '没有找到指定服务',
		10005: '没有找到指定特征值',
		10006: '当前连接已断开',
		10007: '当前特征值不支持此操作',
		10008: '系统上报异常',
		10009: '系统版本低于 4.3 不支持BLE'
	};
	function debounce(func, wait) {
		let timer = null;
		return function(opt) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func && func.call(this, opt);
			}, wait || 60);
		};
	}
	
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
				btn_disabled: true,
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
				printData: [],
				printNumIndex: 0,
				printerNum: 1,
				currentPrint: 1,
				isReceiptSend: false,
				deviceId: '',
				serviceId: '',
				writeId: '',
				readId: '',
				isLabelSend: false
			};
		},
		computed: mapState(['sysinfo', 'Bluetooth']),
		onLoad: function(option) {
			let me = this
			me.isClick = false;
			me.$set(me,'btn_disabled',true)
			if (JSON.stringify(option) != "{}") {
				this.isOrder = true
				var obj = JSON.parse(decodeURIComponent(option.obj))
				this.fetchData(obj[6])
				this.paramsFid = obj[6]
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
							let cuBar = uni.createSelectorQuery().select(".cu-bar");
							var infoHeight = 0;
							var headHeight = 0;
							var cuBarHeight = 0;
							info.boundingClientRect(function(data) { //data - 各种参数
								infoHeight = data.height
							}).exec();
							customHead.boundingClientRect(function(data) { //data - 各种参数
								headHeight = data.height
							}).exec();
							cuBar.boundingClientRect(function(data) { //data - 各种参数
								cuBarHeight = data.height
							}).exec();
							setTimeout(function() {
								me.pageHeight = res.windowHeight - infoHeight - headHeight -
									cuBarHeight - 30
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
			this.bindViewTap({
									name: 'CC3_6065L',
									deviceId: 'C0:16:40:69:60:65'
								})
		},
		onShow() {
			let that = this;
			let width;
			let height;
			uni.getImageInfo({
				src: that.imageSrc,
				success(res) {
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
			textInput(e,item){
				this.$set(item,'amount', e.detail.value)
			},
			//----打印二维码-------
			async bindViewTap2(item,printIndex) {
				console.log("开始打印")
				var that = this;
				let strCmd1 = zksdk.CreatCPCLPage(450, 496, 1);
				strCmd1 += zksdk.addCPCLLocation(2);
				let strCmd2 = zksdk.addCPCLQRCode(0, 0, 'M', 2, 10, "http://ylkd.gzfzdev.com:8090?type=1&code="+item.pickCode);
				let strCmd3 = zksdk.addCPCLText(10, 340, '56', '0', 0, "发货单："+item.billNo);
				strCmd3 += zksdk.addCPCLText(10, 375, '56', '0', 0, "箱码："+item.pickCode);
				strCmd3 += zksdk.addCPCLText(10, 410, '56', '0', 0, "收货请扫码");
				strCmd3 += zksdk.addCPCLPrint();
				var byte1 = gbk.strToGBKByte(strCmd1);
				var byte2 = gbk.stringToArrayBuffer(strCmd2);
				var byte3 = gbk.strToGBKByte(strCmd3);
				var bytes = new ArrayBuffer(byte1.byteLength + byte2.byteLength + byte3.byteLength);
				var dv = new DataView(bytes);
				var dv1 = new DataView(byte1);
				var dv2 = new DataView(byte2);
				var dv3 = new DataView(byte3);
				for (var i = 0; i < byte1.byteLength; i++) {
					dv.setInt8(i, dv1.getInt8(i));
				}
				for (var i = 0; i < byte2.byteLength; i++) {
					dv.setInt8(byte1.byteLength + i, dv2.getInt8(i));
				}
				for (var i = 0; i < byte3.byteLength; i++) {
					dv.setInt8(byte1.byteLength + byte2.byteLength + i, dv3.getInt8(i));
				}
				bytes = pako.myGzip(bytes);
				var datalen = 20;
				if (app.globalData.platform == 'ios') {
					console.log('platform:', app.globalData.platform)
					datalen = 120;
				}
				const opt = {
					deviceId: this.deviceId,
					serviceId: this.serviceId,
					characteristicId: this.writeId,
					value: bytes,
					lasterSuccess: this.onSendSuccess,
					onceLength: datalen 
				}; 
				console.log(opt)
				await zksdk.sendDataToDevice(opt,printIndex);
			},
			//---数据全部发送成功回调----
			onSendSuccess: function(printIndex) {
				console.log("onSendSuccess");
				console.log(printIndex);
				let that = this
				that.printData.splice(printIndex, 1)
				for (let i = 0; i < that.printData.length; i++) {
					that.bindViewTap2(that.printData[i],i);
				}
			}, 
			//链接蓝牙
			bindViewTap: function(e) {
				zksdk.openBlue().then((res) => {
						//搜寻设备
						zksdk.startBluetoothDevicesDiscovery({
							allowDuplicatesKey: false,
							interval: 5000
						});
					})
					.catch((res) => {
						const coode = res.errCode ? res.errCode.toString() : '';
						const msg = errMsg[coode];
						uni.showToast({
							title: msg || coode,
							icon: 'none',
						});
					});
				//----关闭扫描蓝牙设备----
				zksdk.stopBlueDevicesDiscovery();
				this.deviceId = e.deviceId;
				var name = e.name || e.localName;
				// 监听设备的连接状态
				uni.onBLEConnectionStateChange(function(res) {
					console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
				})
				zksdk.createBLEConnection(e.deviceId, this.onConnectSuccess, this.onConnectFail);
				console.log("bindViewTap end")
			}, 
				//---连接成功----
			onConnectSuccess(res) {
				var that = this;
				console.log('onConnectSuccess', res);
				zksdk.getBLEDeviceServices(that.deviceId, this.onGetServicesSuccess, this.onGetServicesFail);
			},
			//---连接失败----
			onConnectFail(res) {
				uni.showToast({
					title: '连接失败',
					icon: 'none',
				});
				uni.hideNavigationBarLoading();
				console.log('onConnectFail', res);
			},
			//---Services获取成功----
			onGetServicesSuccess(res) {
				var that = this;
				console.log('onGetServicesSuccess', res);
				console.log( res);
				this.$set(this,'btn_disabled',false)
				zksdk.getDeviceCharacteristics(that.deviceId, res.serviceId, this.onGetCharacterSuccess, this
					.onGetCharacterFail);
			},
			//---Services获取失败----
			onGetServicesFail(res) {
				uni.showToast({
					title: 'Services获取失败',
					icon: 'none',
				});
				uni.hideNavigationBarLoading();
				console.log('onGetServicesFail', res);
			},
			async onGetCharacterSuccess(res) {
				let that = this
				console.log('onGetCharacterSuccess servid ', res.serviceId);
				console.log('write character ', res.writeId);
				console.log('read character ', res.readId);
				this.$set(this,'serviceId', res.serviceId)
				this.$set(this,'writeId', res.writeId) 
				this.$set(this,'readId', res.readId)
				//-----打开状态通知功能------
				const opt = {
					deviceId: this.deviceId,
					serviceId: this.serviceId,  
					characteristicId: this.readId,
				};
				
				console.log(123333)
				zksdk.onGetBLECharacteristicValueChange(opt, this.onGetBLEValueChange);
			},
			//---Characteristics获取失败----
			onGetCharacterFail(res) {
				uni.showToast({
					title: 'Characteristics获取失败',
					icon: 'none',
				});
				uni.hideNavigationBarLoading();
				console.log('onGetCharacterFail', res);
			},
			//------Characteristic信息变化回调------- 
			onGetBLEValueChange: function(res) {
				var that = this;
				console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
				console.log(util.ab2hex(res.value))
				//if (res.characteristicId == `0000FFF1-0000-1000-8000-00805F9B34FB`)
				{
					var view1 = new DataView(res.value);
					//console.log(res.value.byteLength);
					//console.log(view1.getUint8(0));
					//console.log(view1.getUint8(2));
					if (res.value.byteLength >= 4 && view1.getUint8(0) == 0x1d && view1.getUint8(1) == 0x99) {
						let strSta = " ";
						if (view1.getUint8(2) == 0) strSta = "正常";
						if (view1.getUint8(2) & 0x01) strSta = strSta + ' 缺纸';
						if (view1.getUint8(2) & 0x02) strSta = strSta + ' 开盖';
						if (view1.getUint8(2) & 0x04) strSta = strSta + ' 打印头过热';
						if (view1.getUint8(2) & 0x08) strSta = strSta + ' 定位失败';
						if (view1.getUint8(2) & 0x10) strSta = strSta + ' 低电';
						if (view1.getUint8(2) & 0x20) strSta = strSta + ' 正在打印';
						
						that.$set(that,'State',strSta)
					} else if (res.value.byteLength >= 9 && view1.getUint8(0) == 0x20 && view1.getUint8(1) == 0x06) {
						//---MAC地址获取----             
						let buffer = new ArrayBuffer(6)
						let dataView = new DataView(buffer)
						for (var i = 0; i < 6; i++) dataView.setUint8(i, view1.getUint8(3 + i));
			
						let dev_mac = buffer.join(":");
						that.$set(that,'Dev_mac',dev_mac)
						console.log('mac:' + dev_mac);
					} else if (res.value.byteLength >= 3 && view1.getUint8(0) == 0x1D && view1.getUint8(1) == 0x49 &&
						view1.getUint8(2) == 0x4A) {
						let len = res.value.byteLength
						let dataView = new DataView(recArrayBuff)
						recLen = 0;
						for (var i = 0; i < len - 3; i++) dataView.setUint8(i, view1.getUint8(3 + i));
						recLen = len - 3;
					} else if (res.value.byteLength >= 3 && view1.getUint8(0) == 0x30 && view1.getUint8(1) == 0x00 &&
						view1.getUint8(1) == 0x00) {
						console.log('Resp OK');
					} else {
						if (that.WiFiAPGetFlg) {
							let len = res.value.byteLength;
							let dataView = new DataView(recArrayBuff)
							for (var i = 0; i < len; i++) dataView.setUint8(i + recLen, view1.getUint8(i));
							recLen += len
							if (view1.getUint8(len - 1) == 0 || view1.getUint8(len - 1) == 0x0A) {
								that.WiFiAPName = util.Utf8ArrayToStr(new Uint8Array(recArrayBuff));
								console.log(that.WiFiAPName)
								that.$set(that,'WiFiAPName',that.WiFiAPName)
								recLen = 0;
							}
							that.timer = setTimeout(
								function() {
									// TODO 你需要执行的任务
									console.log('startTimer  500毫秒后执行一次任务')
									var Scan = util.Utf8ArrayToStr(new Uint8Array(recArrayBuff));
									console.log(Scan)
									that.$set(that,'WiFiAPName',that.WiFiAPName)
									recLen = 0;
									that.WiFiAPGetFlg = false;
								}, 500);
						} else {
							var Scan = util.Utf8ArrayToStr(new Uint8Array(res.value));
							console.log(Scan)
							that.$set(that,'State',Scan)
							this.bindViewTap2(null, Scan);
						}
					}
				}
			},
			comfirmData() {
				let that = this
				that.$nextTick(() => {
					var data = that.$refs.citys.clickDataparent();
					console.log(data)
					that.$refs.citys.unClickClose();
					data.forEach((item) => {
						that.cityClick(item.oldData)
					})
				});
			},
			fetchData(id) {
				const me = this
				const obj = {
					pageSize: 50,
					pageNum: 1,
				}
				basic
					.executeBillQuery({
						data: {
							"FilterString": "FID =" + id + "",
							"FormId": "QDEP_Cust_PackInfo",
							"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
							"FieldKeys": "FBillNo,FCreateDate,FOutBillNo,FEntity_FEntryId,FMaterialID.FNumber,FMaterialID.FName,FQty,FBoxBarcode,FPackBarCode,FID,FSrcID,FSrcEntryID",
						}
					}).then(res => {
						let reso = res[0];
						console.log(res)
						if (res.length > 0) {
							var beSelect = []
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
						} else {
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
					if (printData.findIndex(obj => obj.pickCode === this.cuIList[item]['pickCode']) == -1 && this.cuIList[item]['pickCode'] != 0) {
						printData.push({
							pickCode: this.cuIList[item]['pickCode'],
							billNo: this.cuIList[item]['fBillNo']
						})
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
								uni.showNavigationBarLoading();
								me.printData = printData
								me.bindViewTap2(me.printData[0],0)
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
					if (printData.findIndex(obj => obj.pickCode === this.cuIList[item]['pickBigCode']) == -1 && this.cuIList[item]['pickBigCode'] !=0) {
						printData.push({
							pickCode: this.cuIList[item]['pickBigCode'],
							billNo: this.cuIList[item]['fBillNo']
						})
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
								uni.showNavigationBarLoading();
								me.printData = printData
								me.bindViewTap2(me.printData[0],0)
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
				this.cuIList.push({
					...item
				})
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
					console.log(orderParams.findIndex(obj => obj.fid === list[element]['fid']))
					if (orderParams.findIndex(obj => obj.fid === list[element]['fid']) == -1) {
						//提交单据次数
						orderParams.push({
							fid: list[element]['fid'],
							FSrcEntryID: [{
								FENTRYID: list[element]['fEntryId'],
								FEntryOutStatus: "待收货",
								FEntryPackedQty: Number(list[element]['amount'])+Number(list[element]['packedQty'])
							}]
						})
					}else{
						let entryData = orderParams[orderParams.findIndex(obj => obj.fid === list[element]['fid'])]['FSrcEntryID']
						if(entryData.findIndex(obj => obj.FENTRYID === list[element]['fEntryId']) == -1){
							entryData.push({
									FENTRYID: list[element]['fEntryId'],
									FEntryOutStatus: "待收货",
									FEntryPackedQty: Number(list[element]['amount'])+Number(list[element]['packedQty'])
								})
						}else{
							entryData[entryData.findIndex(obj => obj.FENTRYID === list[element]['fEntryId'])]['FEntryPackedQty'] += Number(list[element]['amount'])
							
						}
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
				console.log(orderParams)
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
							for (var item in orderParams) {
								//保存
								basic.kdSave({
									"formid": "SAL_OUTSTOCK",
									"data": {
										"NeedUpDataFields": ["FEntity"],
										"NeedReturnFields": ["FEntity"],
										"IsDeleteEntry": false,
										"Model": {
											"FID": orderParams[item]['fid'],
											"FOutStatus": "待收货",
											"FEntity":orderParams[item]['FSrcEntryID']
										},
									}
								}).then(
									keepRes => {
										console.log(keepRes)
										let keepReso = keepRes[0];
										if (keepRes != null && keepRes['Result'][
												'ResponseStatus'
											]['IsSuccess']) {
											if (Number(item) + 1 == orderParams.length) {
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

								/* basic.unAudit({
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
														if (submitRes != null && submitRes[
																'Result'][
																'ResponseStatus'
															]['IsSuccess']) {
															//审核
															basic.kdAudit({
																"formid": "SAL_OUTSTOCK",
																"data": {
																	"Ids": orderParams[
																		item],
																},
															}).then(
																auditRes => {
																	let auditReso =
																		auditRes[0];
																	if (auditRes != null &&
																		auditRes['Result'][
																			'ResponseStatus'
																		]['IsSuccess']) {
																		if (item + 1 ==
																			orderParams
																			.length) {
																			uni
																		.hideNavigationBarLoading();
																			uni.showToast({
																				title: "保存成功",
																				icon: 'success',
																				duration: 2000,
																				mask: true,
																				success: function() {
																					setTimeout
																						(function() {
																								//要延时执行的代码
																								uni
																							.navigateBack();
																							},
																							2000
																							) //延迟时间
																				}
																			});
																		}
																	} else {
																		this.isClick =
																			false
																		uni
																	.hideNavigationBarLoading();
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
								}); */
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
				let that = this
				basic
					.executeBillQuery({
						data: {
							"FilterString": "FBillNo like '%" + that.form.FBillNo + "%' and FRealQty>FEntryPackedQty",
							"FormId": "SAL_OUTSTOCK",
							"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
							"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FEntryPackedQty",
						}
					}).then(resPoll => {
						let reso = resPoll[0];
						if (resPoll.length > 0) {
							var beSelect = []
							resPoll.forEach((item, index) => {
								beSelect.push({
									fid: item[14],
									fEntryId: item[4],
									fName: item[6]+'('+item[12]+')',
									fNumber: item[5],
									fQty: item[12],
									fBillNo: item[0],
									fSpecification: item[7],
									amount: item[12],
									pickCode: 0,
									pickBigCode: 0,
									packedQty: item[15],
								})
							})
							that.toBeSelected = [...beSelect]
							that.$forceUpdate()
							that.modalName = 'Modal'
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
									"FilterString": "FBillNo like '%" + res.result + "%' and FRealQty>FEntryPackedQty",
									"FormId": "SAL_OUTSTOCK",
									"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
									"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FEntryPackedQty",
								}
							}).then(resPoll => {
								let reso = resPoll[0];
								if (resPoll.length > 0) {
									that.form.FBillNo = res.result
									var beSelect = []
									resPoll.forEach((item, index) => {
										beSelect.push({
											fid: item[14],
											fEntryId: item[4],
											fName: item[6]+'('+item[12]+')',
											fNumber: item[5],
											fQty: item[12],
											fBillNo: item[0],
											fSpecification: item[7],
											amount: item[12],
											pickCode: 0,
											pickBigCode: 0,
											packedQty: item[15],
										})
									})
									that.toBeSelected = [...beSelect]
									that.modalName = 'Modal'
								} else {
									if(resPoll.length == 0){
										uni.showToast({
											icon: 'none',
											title: "该单已全部装箱"
										})
									}else{
										uni.showToast({
											icon: 'none',
											title: reso[0]['Result']['ResponseStatus']['Errors'][0][
												'Message'
											]
										})
									}
								}
							}).catch(err => {
								if(err=="TypeError: Cannot read property '0' of undefined"){
									uni.showToast({
										icon: 'none',
										title: "该单已全部装箱"
									})
								}else{
									uni.showToast({
										icon: 'none',
										title: err[0][0]['Result']['ResponseStatus']['Errors'][0][
											'Message'
										],
									});
								}
							})
					}
				});
			},
			//绑定蓝牙
			/* bindViewTap(e) {
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
						if (e.message == "already connect") {
							BLEInformation.deviceId = title;
							that.getSeviceId()
						} else {
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
			}, */
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
		height: auto;
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