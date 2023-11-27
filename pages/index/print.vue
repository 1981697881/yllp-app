<template>
	<view>
		<cu-custom bgColor="bg-gradual-gradient" class="customHead" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">蓝牙链接</block>
		</cu-custom>
		<text>状态{{State}}</text>
		<view class="section section_gap">
			<text class="section__title">RSSI过滤设置</text>
			<view class="body-view">
				<slider name="RSSI" @change="sliderRSSIchange" max='-20' min='-100' :value="RSSIValue" show-value />
			</view>
			<text class="section__title">名字过滤设置</text>
			<view class="inputView">
				<input class="input" name="BTName" :value="BTNameValue" placeholder="请输入蓝牙名字" auto-focus maxlength="32"
					bindinput="BTNameInput" />
			</view>
		</view>
		<button type="primary" @tap="bindViewTap2" >打印二维码 </button>
		<view class="devices_summary">已发现 {{mydevices.length}} 个外围设备：</view>
		<scroll-view class="device_list" scroll-y scroll-with-animation upper-threshold='50' scroll-top='50'
			scroll-left="10">
			<view v-for="(item, index) in mydevices" :key="index" class="device_item" hover-class="device_item_hover"
				@tap="bindViewTap(item)">
				<view style="font-size: 16px; color: #333;">设备名称:{{item.name}}</view>
				<view style="font-size: 10px">信号强度: {{item.RSSI}}dBm </view><!-- ({{utils.max(0, item.RSSI + 100)}}%) -->
				<view style="font-size: 10px">DeviceID: {{item.deviceId}}</view>
				<view style="font-size: 10px">AdvMAC: {{item.advMac}}</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	const app = getApp()
	import * as zksdk from '@/util/bluetoolth';
	var util = require("../../util/util.js");
	var gbk = require('../../util/printUtil-GBK.js');
	var pako = require('../../util/pako/index.js');
	var recArrayBuff = new ArrayBuffer(256);
	var recLen = 0;
	import {
		mapState
	} from 'vuex'
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

		},
		data() {
			return {
				logs: [],
				list: [],
				mydevices: [],
				deviceName: '',
				deviceId: '',
				serviceId: '',
				writeId: '',
				readId: '',
				advdata: [],
				msg: '',
				State: '',
				rssi: '-80',
				BTName: ''
			}
		},
		created() {

		},
		onLoad() {
			var that = this;
			console.log('bluetooththr onLoad')
			var rssi = uni.getStorageSync('RSSI');
			var BTName = uni.getStorageSync('BTName');
			that.BTNameValue = BTName
			if (rssi == undefined)
				that.RSSIValue = '-95'
			else that.RSSIValue = rssi
			that.BTName = BTName;
			that.rssi = rssi;
			zksdk.openBlue().then((res) => {
					//搜寻设备
					zksdk.startBluetoothDevicesDiscovery({
						allowDuplicatesKey: false,
						interval: 5000
					});
					//监听寻找新设备
					zksdk.onfindBlueDevices(this.onGetDevice)
				})
				.catch((res) => {
					console.log('catch res:' + res);
					const coode = res.errCode ? res.errCode.toString() : '';
					const msg = errMsg[coode];
					uni.showToast({
						title: msg || coode,
						icon: 'none',
					});
				});
		},
		onShow: function() {
			console.log("OnShow");
			/* //搜寻设备
			zksdk.startBluetoothDevicesDiscovery({
				allowDuplicatesKey: false,
				interval: 5000
			});
			//监听寻找新设备
			zksdk.onfindBlueDevices(this.onGetDevice) */
		},

		onUnload: function() {
			
		},

		methods: {
			//----打印二维码-------
			bindViewTap2: function() {
				var that = this;
				let strCmd1 = zksdk.CreatCPCLPage(450, 496, 1);
				strCmd1 += zksdk.addCPCLLocation(2);
				let strCmd2 = zksdk.addCPCLQRCode(10, 40, 'M', 2, 10, "中文二维码测试");
				let strCmd3 = zksdk.addCPCLText(10, 320, '56', '0', 0, "收货请扫码");
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
				zksdk.sendDataToDevice(opt);
			},
			//---数据全部发送成功回调----
			onSendSuccess: function() {
				console.log("onSendSuccess");
			},
			
			BTNameInput: function(e) {
				var that = this;
				that.BTNameValue = e.detail.value
				that.BTName = e.detail.value;
				uni.setStorageSync('BTName', e.detail.value);
				console.log('that.BTName:', that.BTName);
			},

			compare: function(property) {
				return function(a, b) {
					var nameA = a.name.toUpperCase(); // ignore upper and lowercase
					var nameB = b.name.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				}
			},
			//过滤设备列表 
			getNewDevicesList(devices, name) {
				var that = this;
				var newDevices = devices;
				var rssi = that.rssi;
				console.log('RSSI:', rssi);

				//按RSSI过滤
				for (var i = 0; i < newDevices.length;) {
					if (newDevices[i].RSSI < rssi) newDevices.splice(i, 1);
					else i++;
				}

				// 按名字过滤
				if (name != '') {
					for (var i = 0; i < newDevices.length;) {
						if (newDevices[i].name.indexOf(name) == 0) i++;
						else newDevices.splice(i, 1);
					}
				}
				console.log("Get Mac");
				// 广播数据提取MAC地址
				for (var i = 0; i < newDevices.length; i++) {
					if (newDevices[i].hasOwnProperty('advertisData')) {
						console.log(newDevices[i].advertisData);
						console.log(newDevices[i].advertisData.byteLength);
						if (newDevices[i].advertisData.byteLength == 8) {
							//newDevices[i].add("adv");
							console.log("Adv MAC Address");
							console.log(util.buf2hex(newDevices[i].advertisData));
							newDevices[i].advMac = util.buf2hex(newDevices[i].advertisData.slice(2, 7));
						}
					}
				}

				newDevices.sort(this.compare("name"));
				return newDevices;
			},

			//获取设备列表
			onGetDevice: function(res) {
				var that = this;
				console.log('onGetDevice', res);
				var dev = that.getNewDevicesList(res, that.BTName)
				console.log('dev', dev);
				that.mydevices = dev;
			},
			//点击事件处理
			bindViewTap: function(e) {
				//----关闭扫描蓝牙设备----
				zksdk.stopBlueDevicesDiscovery();
				this.deviceId = e.deviceId;
				var name = e.name || e.localName;
				console.log(e)
				// 监听设备的连接状态
				uni.onBLEConnectionStateChange(function(res) {
					console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
				})
				zksdk.createBLEConnection(e.deviceId, this.onConnectSuccess, this.onConnectFail);
				/* uni.setStorageSync('deviceId', deviceId);
				uni.setStorageSync('name', name);
				uni.navigateTo({
					url: '../bluetooththrsec/print?deviceId=' + deviceId + '&name=' + name,
					success: function(res) {
						console.log('---bindViewTap---点击连接蓝牙--success--', res)
					},
					fail: function(res) {
						console.log('---bindViewTap---点击连接蓝牙--fail--', res)
					}
				}) */
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
				console.log('onConnectFail', res);
			},
			//---Services获取成功----
			onGetServicesSuccess(res) {
				var that = this;
				console.log('onGetServicesSuccess', res);
				zksdk.getDeviceCharacteristics(that.deviceId, res.serviceId, this.onGetCharacterSuccess, this
					.onGetCharacterFail);
			},
			//---Services获取失败----
			onGetServicesFail(res) {
				console.log('onGetServicesFail', res);
			},
			onGetCharacterSuccess(res) {
				console.log('onGetCharacterSuccess servid ', res.serviceId);
				console.log('write character ', res.writeId);
				console.log('read character ', res.readId);
				this.$set(this,'serviceId', res.serviceId)
				this.$set(this,'writeId', res.writeId) 
				this.$set(this,'readId', res.readId)
				//---停止扫描蓝牙设备---------
				zksdk.stopBlueDevicesDiscovery();
				//-----打开状态通知功能------
				const opt = {
					deviceId: this.deviceId,
					serviceId: this.serviceId,
					characteristicId: this.readId,
				};
				this.bindViewTap2();
				zksdk.onGetBLECharacteristicValueChange(opt, this.onGetBLEValueChange);
			},
			//---Characteristics获取失败----
			onGetCharacterFail(res) {
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
			// 正在滑动
			sliderRSSIchange: function(e) {
				var that = this;
				that.rssi = e.detail.value;
				uni.setStorageSync('RSSI', e.detail.value);
				console.log("sliderChange", that.rssi);
			},

		}

	}
</script>

<style>
	.section {
		display: inline-block;
		width: 100%;
		position: relative;
	}

	.list-item {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		border: 1px dashed #000;
	}

	.list-item text {
		margin-top: 10rpx;
	}

	button {
		background: red;
	}

	.list-item button {
		margin-right: 10rpx;
	}

	page {
		color: #333;
	}

	.devices_summary {
		margin-top: 30px;
		padding: 10px;
		font-size: 16px;
	}

	.device_list {
		height: 400px;
		margin: 30px 5px;
		margin-top: 0;
		border: 1px solid #EEE;
		border-radius: 5px;
		width: auto;
	}

	.device_item {
		border-bottom: 1px solid #EEE;
		padding: 10px;
		color: #666;
	}

	.device_item_hover {
		background-color: rgba(0, 0, 0, .1);
	}

	.connected_info {
		position: fixed;
		bottom: 0;
		width: 100%;
		background-color: #F0F0F0;
		padding: 10px;
		padding-bottom: 20px;
		margin-bottom: env(safe-area-inset-bottom);
		font-size: 14px;
		min-height: 100px;
		box-shadow: 0px 0px 3px 0px;
	}

	.connected_info .operation {
		position: absolute;
		display: inline-block;
		right: 30px;
	}

	.slider_bg {
		width: 100%;
		height: 100rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.inputView {
		border: 2px solid red;
		border-radius: 40px;
		margin-left: 15px;
		margin-right: 15px;
		margin-top: 15px;
	}

	.input {
		padding-left: 10px;
		height: 44px;
	}
</style>