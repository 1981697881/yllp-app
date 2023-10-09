<template>
	<view>
		<loading :loadModal="loadModal"></loading>
	<cu-custom bgColor="bg-gradual-blue" class="customHead" :isBack="true"><block slot="backText">返回</block><block slot="content">调拨</block></cu-custom>
		<uni-fab
	    :pattern="pattern"
	    :horizontal="horizontal"
		:vertical="vertical"
		:popMenu="popMenu"
		distable
		:direction="direction"
		 @fabClick="fabClick"
		 ></uni-fab>
			<zhilin-picker
			    v-model="show"
			    :data="chooseList"
				:title="title"
				@confirm="chooseClick"
			/> 
	<view class="box getheight">
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action">
				单号:<text>{{form.finBillNo}}</text>
			</view>
			<view class="action">
				日期:
				<ruiDatePicker
				    fields="day"
					class='ruidata'
				    start="2020-00-00"
				    end="2030-12-30"
					:value="form.fdate"
				    @change="bindChange"
				></ruiDatePicker>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<!-- <view class="action">
				<view style="width: 110px;">原仓库:</view>
				        <ld-select :list="stockList"
				        list-key="FName" value-key="FNumber"
				        placeholder="请选择"
				        clearable
				        v-model="form.fdcStockID"
				        @change="stockChange1"></ld-select>
			</view> -->
			<!-- <view class="action">
				<view style="width: 90px;">部门:</view>
				        <ld-select :list="deptList"
				        list-key="FName" value-key="FNumber"
				        placeholder="请选择"
				        clearable
				        v-model="form.fdeptID"
				        @change="deptChange"></ld-select>
			</view> -->
			<view class="action">
				<view>调入仓库:</view>
				        <ld-select :list="stockList"
				        list-key="FName" value-key="FNumber"
				        placeholder="请选择"
				        clearable 
				        v-model="form.fdcStockID"
				        @change="stockChange2"></ld-select>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action" style="width: 100%;">
				<view class="title" style="width: 40px;">备注:</view>
				<input name="input" style="font-size: 13px;width: 100%;text-align: left;border-bottom:1px solid ;" v-model="form.fnote"></input>
			</view>
		</view>
	</view>
	<view class="cu-modal" :class="modalName2=='Modal'?'show':''">
		<view class="cu-dialog" style="height: 450upx;">
			<view class="cu-bar bg-white justify-end" style="height: 60upx;">
				<view class="content">{{popupForm.headName}}</view>
				<view class="action" @tap="hideModal2">
					<text class="cuIcon-close text-red"></text>
				</view>
			</view>
			<view>
				<view class="cu-item" style="width: 100%;">
					<view class="flex">
						<view class="flex-sub">
							<view class="cu-form-group">
								<view class="title">批号:</view>
								<input name="input" style="border-bottom: 1px solid;" v-model="popupForm.fbatchNo"></input>
							</view>
						</view>
						<view class="flex-sub">
							<view class="cu-form-group">
								<view class="title">数量:</view>
								<input name="input" type='digit' style="border-bottom: 1px solid;" v-model="popupForm.quantity"></input>
							</view>
						</view>
					</view>
				</view>
				<view class="cu-item" style="width: 100%;">
					<view class="flex">
						<view class="flex-sub">
							<view class="cu-form-group">
								<view class="title">流程卡号:</view>
								<input name="input" style="border-bottom: 1px solid;" v-model="popupForm.fcardNum"></input>
							</view>
						</view>
					</view>
				</view>
				<!-- <view class="cu-item" style="width: 100%;">
					<view class="flex">
						<view class="flex-sub">
							<view class="cu-form-group">
								<view class="title">原库位:</view>
								<input name="input" style="border-bottom: 1px solid;" v-model="popupForm.fsCSPId"></input>
								<button class="cu-btn round lines-red line-red shadow" @tap="$manyCk(scanPositionO)">扫码</button>
							</view>
						</view>
					</view>
				</view> -->
				<view class="cu-item" style="width: 100%;">
					<view class="flex">
						<view class="flex-sub">
							<view class="cu-form-group">
								<view class="title">调入库位:</view>
								<input name="input" style="border-bottom: 1px solid;"  v-model="popupForm.fdCSPId"></input>
								<button class="cu-btn round lines-red line-red shadow"  @tap="$manyCk(scanPositionT)">扫码</button>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view style="clear: both;" class="cu-bar bg-white justify-end padding-bottom-xl">
				<view class="action">
					<button class="cu-btn line-green text-green" @tap="hideModal2">取消</button>
					<button class="cu-btn bg-green margin-left" @tap="$manyCk(saveCom)">确定</button>
				</view>
			</view>
		</view>
	</view>
	<scroll-view scroll-y class="page" :style="{ 'height': pageHeight + 'px' }">
		<view v-for="(item,index) in cuIList" :key="index">
				<view class="cu-list menu-avatar">
					<view class="cu-item" style="width: 100%;margin-top: 2px;height: 320upx;"  :class="modalName=='move-box-'+ index?'move-cur':''" 
				 @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index" >
						<view style="clear: both;width: 100%;" class="grid text-center col-2" @tap="showModal2(index, item)" data-target="Modal" data-number="item.number">
							<view class="text-grey">序号:{{item.index=(index + 1)}}</view>
							<view class="text-grey">编码:{{item.FNumber}}</view> 
							<view class="text-grey">名称:{{item.FName}}</view>
							<view class="text-grey">批号:{{item.fbatchNo}}</view>
							<view class="text-grey">原仓位:{{item.fsCSPId}}</view>
							<view class="text-grey">原仓库:{{item.FStockName}}</view>
							<view class="text-grey">库存数量:{{item.FQty}}</view>
							<view class="text-grey">调拨数量:{{item.quantity}}</view>
							<view class="text-grey">规格:{{item.FModel}}</view>
							<view class="text-grey">单位:{{item.FUnitName}}</view>
							<view class="text-grey">调入仓位:{{item.fdCSPId}}</view>
							<view class="text-grey">流程卡号:{{item.fcardNum}}</view>
							<!-- <view class="text-grey">
								<picker @change="PickerChange2($event, item)" :value="pickerVal" :range-key="'FName'" :range="stockList">
									<view class="picker">
										<button class="cu-btn sm round bg-green shadow" >
										<text class="cuIcon-homefill">
										</text>现仓库</button>
									</view>
								</picker>
							</view> -->
							<view class="text-grey" style="padding-top: 3px;">{{item.stockName}}</view>
							<view class="text-grey" style="padding-top: 3px;">
								<picker @change="PickerChange($event, item)" :value="pickerVal" :range-key="'FName'" :range="stockList">
									<view class="picker">
										<button class="cu-btn sm round bg-green shadow" >
										<text class="cuIcon-homefill">
										</text>调入仓库</button>
									</view>
								</picker>
							</view>
						</view>
						<view class="move">
							<view class="bg-red" @tap="del(index,item)">删除</view>
						</view>
					</view>
				</view>
		</view>
		<view class="cu-bar tabbar shadow foot">
			<view class="box text-center">
				<button :disabled="isClick" class="cu-btn bg-green shadow-blur round lg" style="width: 40%;margin-right: 10%;" @tap="$manyCk(saveData)">提交</button>
				<button class="cu-btn bg-blue shadow-blur round lg" style="width: 40%;" @tap="$manyCk(clearList)">清空</button>
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
	import warehouse from '@/api/warehouse';
	import loading from '@/components/loading';
	import service from '@/service.js';
	 import zhilinPicker from "@/components/zhilin-picker/zhilin-picker.vue"
	export default {
		 components: {ruiDatePicker, ldSelect, uniFab, loading, zhilinPicker},
			data() {
				return {
					show: false,
					title: '选择库存',
					pageHeight: 0,
					headName: '',
					isOrder: false,
					onoff: true,
					isClick: false,
					loadModal: false,
					pickerVal: null,
					modalName: null,
					modalName2: null,
					gridCol: 3,
					form: {
						finBillNo: null,
						fdate: '',
						bNum: 0,
						fnote: '',
						fbillerID: null,
						fdcStockID: '', 
						fscStockID: '',
						fdeptID: '',
					},
					borrowItem: {},
					popupForm: {
						quantity: '',
						fbatchNo: '',
						fcardNum: '',
						fdCSPId: '',
					},
					chooseList: [],
					skin: false,
					listTouchStart: 0,
					listTouchDirection: null,
					deptList: [],
					stockList: [],
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
					cuIList: [],
					startDate: null,
					endDate: null,	 
				};
			},
			onLoad: function (option) {
				let me = this
				me.loadModal = true
				me.initMain()
				if(JSON.stringify(option) != "{}"){
					me.isDis = true
					me.form.fdeptID = option.FDeptNumber
					 me.form.FCustNumber = option.FCustNumber
					 this.billNo = option.billNo 
					me.source = option.tranType 
					basic.getOrderList({
						billNo: option.billNo,
						/* startDate: option.startDate,
						endDate: option.endDate, */
						tranType: option.tranType,
						type: option.type, 
					}).then(res => {
						if(res.success){
							me.isOrder = true
							let data = res.data.list
							for(let i in data){
								me.cuIList.push({ 
									Fdate: data[i].Fdate,
									 FNumber: data[i].FItemNumber,
									 FName: data[i].FItemName,
									 FIsStockMgr: data[i].FIsStockMgr,
									 FItemID: data[i].FItemID,
									FModel: data[i].FModel,
									stockName: data[i].FDCStockName,
									stockId: data[i].FDCStockNumber,
									FStockName: data[i].FSCStockName,
									FStockNumber: data[i].FSCStockNumber,
									fdCSPId: data[i].FDCSPName,
									fsCSPId: data[i].FSCSPName,
									 fsourceBillNo: data[i].FBillNo,
									 Famount: data[i].Famount,
									 Fauxprice: data[i].Fauxprice,
									 fsourceEntryID: data[i].FEntryID,
									 fsourceTranType: data[i].FTranType,
									 quantity: data[i].Fauxqty,
									 FUnitNumber: data[i].FUnitNumber,
									 FUnitName: data[i].FUnitName
							})
						}
							me.form.FCustName = data[0].FCustName
							me.form.bNum = data.length
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.msg,
					});
				})
			}
		},
		 onReady: function() {
			 var me = this
			 
			 if(service.getUsers().length > 0){
			 	if(service.getUsers()[0].account !='' && service.getUsers()[0].account != "undefined"){
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
						setTimeout(function () {
								me.pageHeight= res.windowHeight - infoHeight - headHeight - 40
								}, 1000);
						     }
						});
				}
			}
			
    },
		methods: {
			clearList() {
				const that = this
				if(that.cuIList.length>0){
					uni.showModal({
						title: '温馨提示',
						content: '是否清空列表，清空之后将无法还原！',
						success: function (res) {
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
			initMain() {
				const me = this
				me.form.fdate = this.getDay('', 0).date
				basic.getBillNo({'TranType':41}).then(res => {
					console.log(res)
					if(res.success){
						me.form.finBillNo=res.data
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.msg,
					});
				});
				basic.getDeptList({}).then(res => {
					if(res.success){
						me.deptList=res.data
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.msg,
					});
				});
				basic.getStockList({}).then(res => {
					if(res.success){
						me.stockList=res.data
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.msg,
					});
				})
				me.loadModal = false
				me.isClick = false
			},
			saveData(){
				this.isClick = true
				let portData = {}
				let list = this.cuIList
				let array = []
				let result = []
				for(let i in list){
					let obj = {}
					obj.fauxqty = list[i].quantity
					obj.fqty = list[i].quantity
					obj.fsCStockId = list[i].FStockNumber
					obj.fdCStockId = list[i].stockId
					if(list[i].stockId == null || typeof list[i].stockId == 'undefined'){
						result.push(list[i].index)
					}
					obj.fentryId = list[i].index
					obj.fbatchNo = list[i].fbatchNo
					obj.finBillNo = this.form.finBillNo
					obj.fitemId = list[i].FNumber
					obj.fauxprice = list[i].Fauxprice != null && typeof list[i].Fauxprice != "undefined" ? list[i].Fauxprice : 0
					obj.famount = list[i].Famount != null && typeof list[i].Famount != "undefined" ? list[i].Famount : 0  
					obj.funitId = list[i].FUnitID 
					obj.fdCSPId = list[i].fdCSPId
					obj.fsCSPId = list[i].fsCSPId
					obj.fcardNum = list[i].fcardNum
					obj.fsourceBillNo = list[i].fsourceBillNo == null || list[i].fsourceBillNo == "undefined" ? '' :  list[i].fsourceBillNo
					obj.fsourceEntryID = list[i].fsourceEntryID == null || list[i].fsourceEntryID == "undefined" ? '' :  list[i].fsourceEntryID 
					obj.fsourceTranType = list[i].fsourceTranType == null || list[i].fsourceTranType == "undefined" ? '' :  list[i].fsourceTranType
					array.push(obj)	
				}
				portData.items = array
				portData.finBillNo = this.form.finBillNo
				portData.fdate = this.form.fdate
				portData.fbillerID = this.form.fbillerID
				portData.fdeptId = this.form.fdeptID
				console.log(JSON.stringify(portData))
				if(result.length == 0){
					warehouse.addTrans(portData).then(res => {
						if(res.success){
							this.cuIList = []
							uni.showToast({
								icon: 'success',
								title: res.msg,
							});
							this.form.bNum = 0
							this.initMain()
							if(this.isOrder){
								setTimeout(function () {
									uni.$emit("handleBack",{startDate: me.startDate,endDate: me.endDate,source: me.source });
									uni.navigateBack({
										 url: '../warehouse/transfersActive'
									});
								}, 1000)
								
						}
						}
					}).catch(err => {
						uni.showToast({
							icon: 'none',
							title: err.msg,
						});
						this.isClick = false
					})
				}else{
					uni.showToast({
						icon: 'none',
						title: '仓库不允许为空',
					});
					this.isClick = false
				}
			},
			submitCom(){
				var me = this
				if(me.popupForm.fdCSPId !='' && me.popupForm.fdCSPId !=null){
					basic.selectFdCStockIdByFdCSPId({'fdCSPId':me.popupForm.fdCSPId}).then(reso => {
						if(reso.data != null && reso.data != ''){
							if(reso.data['FIsStockMgr']){
								me.borrowItem.stockName = reso.data['stockName'];
								me.borrowItem.stockId = reso.data['stockNumber'];
								me.borrowItem.FIsStockMgr = reso.data['FIsStockMgr'];
								me.borrowItem.fdCSPId = me.popupForm.fdCSPId
								me.borrowItem.fcardNum = me.popupForm.fcardNum
								me.borrowItem.quantity = me.popupForm.quantity
								me.borrowItem.fbatchNo = me.popupForm.fbatchNo
								me.modalName2 = null 
							}else{
								me.borrowItem.stockName = reso.data['stockName'];
								me.borrowItem.stockId = reso.data['stockNumber'];
								me.borrowItem.FIsStockMgr = reso.data['FIsStockMgr'];
								me.borrowItem.fdCSPId = ''
								me.borrowItem.fcardNum = me.popupForm.fcardNum
								me.borrowItem.quantity = me.popupForm.quantity
								me.borrowItem.fbatchNo = me.popupForm.fbatchNo
								me.modalName2 = null 
							}
						}else{
							uni.showToast({
								icon: 'none',
								title: '该库位不存在仓库中！',
							});
						}
					})
				}else{
					if(me.popupForm.FIsStockMgr){
						return uni.showToast({
							icon: 'none',
							title: '仓位已启用，请输入仓位！',
						});
					}else{ 
						me.borrowItem.fdCSPId = ''
						me.borrowItem.fcardNum = me.popupForm.fcardNum
						me.borrowItem.quantity = me.popupForm.quantity
						me.borrowItem.fbatchNo = me.popupForm.fbatchNo
						me.modalName2 = null 
					}
				} 
			},
			saveCom(){
				var me = this
				if (this.popupForm.quantity > me.borrowItem.Fauxqty) {
					uni.showModal({
						title: '温馨提示',
						content: '调拨数量大于单据数量！请确认！',
						success: function(res) {
							if (res.confirm) {
								me.submitCom()
							} else if (res.cancel) {
								return
							}
						}
					});
				} else {
					me.submitCom()
				}
				
				/* if(me.popupForm.FIsStockMgrT){
					basic.selectFdCStockIdByFdCSPId({'fdCSPId':me.popupForm.fdCSPId}).then(reso => {
						if(reso.data != null && reso.data != ''){
								if(me.popupForm.fdCSPId !='' && me.popupForm.fdCSPId !=null){
									me.borrowItem.FStockName = reso.data['FName'];
									me.borrowItem.FStockNumber = reso.data['FNumber'];
									me.borrowItem.FIsStockMgrT = reso.data['FIsStockMgr'];
									me.borrowItem.fdCSPId = me.popupForm.fdCSPId
								}else{
									return uni.showToast({
										icon: 'none',
										title: '仓位已启用，请输入仓位！',
									});
								}
						}else{
							uni.showToast({
								icon: 'none',
								title: '该库位不存在仓库中！',
							});
						}
					})
				}else{
					me.borrowItem.fdCSPId = me.popupForm.fdCSPId
				} */
				
			},
			del(index, item) {
				this.cuIList.splice(index,1)
				this.form.bNum = this.cuIList.length
			},
			showModal(e) {
				this.modalName = e.currentTarget.dataset.target
			},
			showModal2(index, item) {
				/* if(item.stockId == null || item.stockId == ''){
					return uni.showToast({
						icon: 'none',
						title: '请先选择仓库！',
					});
				} */
				this.modalName2 = 'Modal'
				if(item.fbatchNo == null || typeof item.fbatchNo == 'undefined'){
					item.fbatchNo = ''
				}
				/* if(item.fsCSPId == null || typeof item.fsCSPId == 'undefined'){
					item.fsCSPId = ''
				} */
				if(item.fdCSPId == null || typeof item.fdCSPId == 'undefined'){
					item.fdCSPId = ''
				}
				if(item.quantity == null || typeof item.quantity == 'undefined'){
					item.quantity = ''
				}
				if(item.fcardNum == null || typeof item.fcardNum == 'undefined'){
					item.fcardNum = ''
				}
				this.popupForm = {
					quantity: item.quantity,
					fbatchNo: item.fbatchNo,
					fcardNum: item.fcardNum,
					/* fsCSPId: item.fsCSPId, */
					FIsStockMgr: item.FIsStockMgr,
					fdCSPId: item.fdCSPId
				}
				this.borrowItem = item
			},
			hideModal(e) {
				this.modalName = null
			},
			hideModal2(e) {
				this.modalName2 = null
				this.popupForm = {}
			},
			// 查询前后三天日期
			     getDay(date, day){
			       var today = new Date();
			        var targetday_milliseconds=today.getTime() + 1000*60*60*24*day
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
			        if(month.toString().length == 1) {
			          m = "0" + month;
			        }
			        return m;
			      },
				 deptChange(val){
				         this.form.fdeptID = val
				   },
				   stockChange1(val){
				 						let sList = this.stockList
				 						let list = this.cuIList
				 						const me = this
				 						for(let i in sList){
				 							if(sList[i].FNumber == val){
				 								for(let j in list){
													me.$set(list[j],'FStockName', sList[i].FName);
													me.$set(list[j],'FIsStockMgrT', sList[i].FIsStockMgr);
													me.$set(list[j],'FStockNumber', val);
				 									
				 								}
				 							}
				 							
				 						}
				     },
					 stockChange2(val){
					 	let sList = this.stockList
						let list = this.cuIList
					 	const me = this
					 	for(let i in sList){
					 		if(sList[i].FNumber == val){
					 			for(let j in list){
					 				me.$set(list[j],'stockName', sList[i].FName);
					 				me.$set(list[j],'FIsStockMgr', sList[i].FIsStockMgr);
					 				me.$set(list[j],'stockId', val);
					 				me.$set(list[j],'fdCSPId', '');
					 			}
					 		}
					 	}
					  },
					  bindChange(e){
						   this.form.fdate = e
						  }, 
		PickerChange(e, item) {
			this.$set(item,'stockName', this.stockList[e.detail.value].FName);
			this.$set(item,'stockId', this.stockList[e.detail.value].FNumber);
			this.$set(item,'FIsStockMgr', this.stockList[e.detail.value].FIsStockMgr);
			this.$set(item,'fdCSPId', '');
		},PickerChange2(e, item) {
			this.$set(item,'FStockName', this.stockList[e.detail.value].FName);
			this.$set(item,'FStockNumber', this.stockList[e.detail.value].FNumber);
			this.$set(item,'FIsStockMgrT', this.stockList[e.detail.value].FIsStockMgr);
		},
		scanPositionO(){
			let me = this
			uni.scanCode({
				success:function(res){
					basic.selectFdCStockIdByFdCSPId({'fdCSPId':res.result}).then(reso => {
						if(reso.data != null && reso.data != ''){
							me.popupForm.fsCSPId = res.result
							me.popupForm.stockName = reso.data['stockName'];
							me.popupForm.stockId = reso.data['stockNumber'];
							me.popupForm.FIsStockMgr = reso.data['FIsStockMgr'];
						}else{
							uni.showToast({
								icon: 'none',
								title: '该库位不存在仓库中！',
							});
						}
					})
					
				},
			})
		},
		scanPositionT(){
			let me = this
			uni.scanCode({
				success:function(res){
					basic.selectFdCStockIdByFdCSPId({'fdCSPId':res.result}).then(reso => {
						if(reso.data != null && reso.data != ''){
							me.popupForm.fdCSPId = res.result
							me.popupForm.stockName = reso.data['stockName'];
							me.popupForm.stockId = reso.data['stockNumber'];
							me.popupForm.FIsStockMgr = reso.data['FIsStockMgr'];
						}else{
							uni.showToast({
								icon: 'none',
								title: '该库位不存在仓库中！',
							});
						}
					})
					
				},
			})
		},
		chooseClick(val){
			console.log(val)
			var that = this
			var choose = val
			let number = 0;
			for(let j in choose){
				if(that.isOrder){
						  for(let i in that.cuIList){
							  if(choose[j]['FItemID'] == that.cuIList[i]['FItemID']){
								  if(choose[j]['stockNumber'] == that.cuIList[i]['stockId'] && choose[j]['fbatchNo'] == that.cuIList[i]['fbatchNo']){
									  if(choose[j]['quantity'] == null){
										choose[j]['quantity'] = 1
									  }
									  if(choose[j]['isEnable'] == 2){
										choose[j]['uuid'] = null
									  }
									  that.cuIList[i]['quantity'] =  parseFloat(that.cuIList[i]['quantity']) + parseFloat(choose[j]['quantity'])
									  number ++
									  break
								  } 
							  }else{
								uni.showToast({
									icon: 'none',
									title: '该物料不在所选列表中！',
								});
								number ++
								break
							  }			
						  }
						  if(number == 0){
							  if(choose[j]['quantity'] == null){
								choose[j]['quantity'] = 1
							  }
							  if(choose[j]['isEnable'] == 2){
								choose[j]['uuid'] = null
							  }
							  choose[j].stockName = choose[j].stockNumber
							  choose[j].stockId = choose[j].warehouse
							   choose[j].fbatchNo = choose[j].FBatchNo
							  choose[j].FIsStockMgr = choose[j].FIsStockMgr
							  that.cuIList.push(choose[j])
						  }
				}else{
					  for(let i in that.cuIList){
						  if(choose[j]['FItemID'] == that.cuIList[i]['FItemID'] && choose[j]['FStockNumber'] == that.cuIList[i]['FStockNumber'] && choose[j]['fbatchNo'] == that.cuIList[i]['fbatchNo']){
							  if(choose[j]['quantity'] == null){
								choose[j]['quantity'] = 1
							  }
							  if(choose[j]['isEnable'] == 2){
								choose[j]['uuid'] = null
							  }
							  that.cuIList[i]['quantity'] =  parseFloat(that.cuIList[i]['quantity']) + parseFloat(choose[j]['quantity'])
							  number ++
							  break
						  } 
					  }
					  if(number == 0){
						  if(choose[j]['quantity'] == null){
							choose[j]['quantity'] = 1
						  }
						  if(choose[j]['isEnable'] == 2){
							choose[j]['uuid'] = null
						  }
						  choose[j].stockName = choose[j].stockNumber
						  choose[j].stockId = choose[j].warehouse
						  choose[j].fbatchNo = choose[j].FBatchNo
						  choose[j].fsCSPId = choose[j].FStockPlacename
						  choose[j].FIsStockMgr = choose[j].FIsStockMgr
						  that.cuIList.push(choose[j])
					  }
				}  
			}
		},
		fabClick() {
			var that = this
			let resultA = []
			uni.scanCode({ 
				success:function(res){
					basic.inventoryByBarcode({'uuid':res.result}).then(reso => {
						if(reso.success){
							console.log(reso)
							that.chooseList = []
							for(let i in reso.data) {
								that.chooseList.push(reso.data[i])				
							}
							that.show = true
						}
					}).catch(err => {
						uni.showToast({
							icon: 'none',
							title: err.msg,
						});
					})
				} 
			});
		},// ListTouch触摸开始
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX
			},

			// ListTouch计算方向
			ListTouchMove(e) {
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
			},

			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			}
		}
	}
</script>

<style>
	.cu-item{
		float: left;
		width: 50%;
	}
	.cu-item .content{
		float: left;
	}
	.cu-list.menu-avatar>.cu-item .content{
		left: 5px;
	}
	.cu-list.menu-avatar>.cu-item .action{
		
	}
	.input{
		height: 30px;
	}
	.box{
		width: 100%;
	}
	.uni-input-placeholder, .uni-input-input{
		font-size: 13px;
	}
	.action,.content{
		font-size: 13px !important;
	}
	.ruidata{
		font-size: 13px;
		height: 7vw !important;
	}
	.cu-bar{
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
