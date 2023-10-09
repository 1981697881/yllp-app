<template>
	<view>
	<loading :loadModal="loadModal"></loading>
	<cu-custom bgColor="bg-gradual-blue" class="customHead" :isBack="true"><block slot="backText">返回</block><block slot="content">盘点</block></cu-custom>
		<!-- <uni-fab
	    :pattern="pattern"
	    :horizontal="horizontal"
		:vertical="vertical"
		:popMenu="popMenu"
		distable
		:direction="direction"
		 @fabClick="fabClick"
		 ></uni-fab> -->
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
			<view class="action">
				<view style="width: 90px;">部门:</view>
				        <ld-select :list="deptList"
				        list-key="FName" value-key="FNumber"
				        placeholder="请选择"
				        clearable
				        v-model="form.fdeptID"
				        @change="deptChange"></ld-select>
			</view>
			<view class="action">
				<view style="width: 90px;">仓库:</view>
				        <ld-select :list="stockList"
				        list-key="FName" value-key="FNumber"
				        placeholder="请选择"
				        clearable
				        v-model="form.fdCStockId"
				        @change="stockChange"></ld-select>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom" style="height: 60upx;">
			<view class="action" style="width: 100%;">
				<view style="width: 40px;">备注:</view>
				      <input name="input" style="font-size: 13px;width: 100%; border-bottom:1px solid;margin-right: 10px;" v-model="form.fnote"></input>
			</view>
		</view>
	</view>
	<view class="cu-modal" :class="modalName2=='Modal'?'show':''">
		<view class="cu-dialog" style="height: 350upx;">
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
								<input name="input" readOnly style="border-bottom: 1px solid;" v-model="popupForm.batchno"></input>
							</view>
						</view>
						<view class="flex-sub">
							<view class="cu-form-group">
								<view class="title">实存数量:</view>
								<input name="input" type='digit' style="border-bottom: 1px solid;" v-model="popupForm.FCheckQty"></input>
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
		<view  v-for="(item,index) in cuIList" :key="index">
				<view class="cu-list menu-avatar">
					<view class="cu-item" style="width: 100%;margin-top: 2px;height: 180upx;"  :class="modalName=='move-box-'+ index?'move-cur':''" 
				 @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index" >
						<view style="clear: both;width: 100%;" class="grid text-center col-2" @tap="showModal2(index, item)" data-target="Modal" data-number="item.number">
							<view class="text-grey">序号:{{index + 1}}</view>
							<view class="text-grey">{{item.FItemNumber}}</view>
							<view class="text-grey">{{item.FName}}</view>
							<view class="text-grey">批号:{{item.FBatchNo}}</view>
							<view class="text-grey">单位:{{item.FCUUnitName}}</view>
							<view class="text-grey">仓库:{{item.Fstockname}}</view>
							<view class="text-grey">数量:{{item.FQty}}</view>
							<view class="text-grey">实存数量:{{item.FCheckQty}}</view>
						</view>
						<view class="move">
							<view class="bg-red" @tap="del(index,item)">删除</view>
						</view>
					</view>
				</view>
		</view>
		<view class="cu-bar tabbar shadow foot">
			<view class="box text-center">
				<button :disabled="isClick" class="cu-btn bg-blue shadow-blur lg" style="width: 48%;margin-right: 1%;" @tap="$manyCk(saveData)">提交</button>
				<button class="cu-btn bg-blue shadow-blur lg" style="width: 48%;margin-right: 1%;" @tap="$manyCk(clearList)">清空</button>
			</view>
		</view>
	</scroll-view>
	</view>
</template>
<script>
	import ruiDatePicker from '@/components/rattenking-dtpicker/rattenking-dtpicker.vue';
	 import ldSelect from '@/components/ld-select/ld-select.vue'
	 import uniFab from '@/components/uni-fab/uni-fab.vue';
	 import loading from '@/components/loading';
	import basic from '@/api/basic';
	import warehouse from '@/api/warehouse';
	export default {
		 components: {ruiDatePicker, ldSelect, uniFab, loading},
			data() {
				return {
					pageHeight: 0,
					headName: '',
					isOrder: false,
					pickerVal: null,
					isClick: false,
					loadModal: false,
					modalName: null, 
					modalName2: null,
					switchA: false,
					onoff: true,
					gridCol: 3,
					form: {
						finBillNo: null,
						fdate: '',
						bNum: 0,
						fnote: '',
						fdCStockId: '',
						fdeptID: '',
					},
					borrowItem: {},
					popupForm: {
						quantity: '',
						fbatchNo: '',
						positions: ''
					},
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
				};
			},
			onLoad: function (option) {
				this.loadModal = true
				if(JSON.stringify(option) != "{}"){
					this.form.finBillNo = option.FProcessID
					warehouse.invCheckList({projectId: option.FID}).then(res => {
						if(res.success){
							this.cuIList=res.data
							this.loadModal = false
						}
					}).catch(err => {
						uni.showToast({
							icon: 'none',
							title: res.msg,
						});
					})
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
			 setTimeout(function () {
			 		me.pageHeight= res.windowHeight - infoHeight - headHeight
			 		}, 1000);
			      }
			 });
			 me.initMain()
			  
    },
		methods: {
			initMain(){
				const me = this
				me.form.fdate = this.getDay('', 0).date
				basic.getDeptList({}).then(res => {
					if(res.success){
						me.deptList=res.data
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: res.msg,
					});
				});
				basic.getStockList({}).then(res => {
					if(res.success){
						me.stockList=res.data
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: res.msg,
					});
				})
				this.isClick = false
			},
			SwitchA(e) {
				this.switchA = e.detail.value
			},
			clearList() {
				const that = this
				if(that.cuIList.length>0){
					uni.showModal({
						title: '温馨提示',
						content: '是否清空列表，清空之后将无法还原！',
						success: function (res) {
							if (res.confirm) {
							   that.cuIList = []
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					});
				}
			},
			saveData(){
				this.isClick = true
						let portData = {}
						let list = this.cuIList
						let array = []
						for(let i in list){
							let obj = {}
							obj.unitId = list[i].FUnitID
							obj.stockId = list[i].FStockID
							obj.batchNo = list[i].FBatchNo
							obj.checkQty = list[i].FCheckQty
							obj.itemId = list[i].FItemID
							obj.projectId = list[i].FProjectID
							obj.qty = list[i].FQty
							array.push(obj)	
						}
						warehouse.invCheckQty(JSON.stringify(array)).then(res => {
							if(res.success){
								this.cuIList = []
								this.initMain()
								uni.showToast({
									icon: 'success',
									title: res.msg,
								});
							}
						}).catch(err => {
							uni.showToast({
								icon: 'none',
								title: err.msg,
							});
							this.isClick = false
						})
					},
					saveCom(){
						var me = this
						if(me.popupForm.FIsStockMgr){
							basic.selectFdCStockIdByFdCSPId({'fdCSPId':me.popupForm.positions}).then(reso => {
								if(reso.data != null && reso.data != ''){
										if(me.popupForm.positions !='' && me.popupForm.positions !=null){
											me.borrowItem.stockName = reso.data['stockName'];
											me.borrowItem.stockId = reso.data['stockNumber'];
											me.borrowItem.FIsStockMgr = reso.data['FIsStockMgr'];
											me.borrowItem.quantity = me.popupForm.quantity
											me.borrowItem.fbatchNo = me.popupForm.fbatchNo
											me.borrowItem.positions = me.popupForm.positions
											me.modalName2 = null 
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
							me.borrowItem.quantity = me.popupForm.quantity
							me.borrowItem.fbatchNo = me.popupForm.fbatchNo
							me.borrowItem.positions = ''
							me.modalName2 = null 
						}
					},
					del(index, item) {
						this.cuIList.splice(index,1)
						this.form.bNum = this.cuIList.length
					},
					showModal(e) {
						this.modalName = e.currentTarget.dataset.target
					},
					showModal2(index, item) {
						this.modalName2 = 'Modal'
						if(item.fbatchNo == null || typeof item.fbatchNo == 'undefined'){
							item.fbatchNo = ''
						}
						if(item.positions == null || typeof item.positions == 'undefined'){
							item.positions = ''
						}
						if(item.quantity == null || typeof item.quantity == 'undefined'){
							item.quantity = ''
						}
						this.popupForm = {
							quantity: item.quantity,
							fbatchNo: item.fbatchNo,
							positions: item.positions
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
						   stockChange(val){
						 						let sList = this.stockList
						 						let list = this.cuIList
						 						const me = this
						 						for(let i in sList){
						 							if(sList[i].FNumber == val){
						 								for(let j in list){
						 									me.$set(list[j],'stockName', sList[i].FName);
						 									me.$set(list[j],'stockId', val);
						 								}
						 							}
						 							
						 						}
						     },
				bindChange(e){
					this.form.fdate = e
			  }, 
				PickerChange(e, item) {
					this.$set(item,'stockName', e.detail.value);
					this.$set(item,'stockId', this.stockList[e.detail.value].FNumber);
				},
				scanPosition(){
					let me = this
					uni.scanCode({
						success:function(res){
							basic.selectFdCStockIdByFdCSPId({'fdCSPId':res.result}).then(reso => {
								if(reso.data != null && reso.data != ''){
									me.popupForm.positions = res.result;
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
				fabClick() {
					var that = this
					uni.scanCode({
						success:function(res){
							warehouse.barcodeScan({'uuid':res.result}).then(reso => {
								console.log(reso.data)
								if(reso.success){
										let number = 0;
										  for(let i in that.cuIList){
											  if(reso.data['number'] == that.cuIList[i]['number'] && reso.data['uuid'] == that.cuIList[i]['uuid']){
												  if(reso.data['quantity'] == null){
												  	reso.data['quantity'] = 1
												  }
												  that.cuIList[i]['quantity'] =  parseFloat(that.cuIList[i]['quantity']) + parseFloat(reso.data['quantity'])
												  number ++
												  break
											  } 
										  }
										  if(number == 0){
											  if(reso.data['quantity'] == null){
											  	reso.data['quantity'] = 1
											  }
											  that.cuIList.push(reso.data)
											  that.form.bNum = that.cuIList.length
										  }
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
