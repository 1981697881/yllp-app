<template>
	<view class="zhilin-picker">
		<uni-popup ref="popup" type="top" @change="popupChange">
			<uni-nav-bar  @clickLeft="clickLeft" @clickRight="tapOK" rightText="确定" left-icon="closeempty" :title="title" :border="true"></uni-nav-bar>
			<view class="usb">
				<uni-search-bar v-if="showSearch && data.length" :radius="100" cancelButton="none" v-model="searchVal"></uni-search-bar>
			</view>
			<view class="main" v-if="list.length">
				<scroll-view scroll-y="true" @scrolltolower="lower" :lower-threshold="1">
					<view style='border-bottom:1px solid #cccccc ;' class="scroll-view-item" v-for="(v,i) in list" :key="i" @tap="tapItem(v.RowNumber)" :class="selected.indexOf(v.RowNumber)>-1?'selected':null">
						<view style="clear: both;width: 90%;padding:0px;display: inline-block;">
							<view style="width:50%; float: left;padding:0px;">名称:{{v.FName}}</view>
							<view style="width:50%;float: left;padding:0px;">编码:{{v.FNumber}}</view>
							<view style="width:50%;float: left;padding:0px;">规格型号:{{v.FModel}}</view>
							<view style="width:50%;float: left;padding:0px;">数量:{{v.FQty}}</view>
							<view style="width:50%;float: left;padding:0px;">仓库:{{v.FStockName}}</view>
							<view style="width:50%;float: left;padding:0px;">批号:{{v.FBatchNo}}</view>
						</view>
						<icon v-show="selected.indexOf(v.RowNumber)>-1" type="success_no_circle" size="22" />
					</view>
					<view v-if="showBottom" class="isBottom">已经到底啦~</view>
				</scroll-view>
				<view class="loadingBox" v-show="loading">
					<uni-load-more status="loading"></uni-load-more>
				</view>
			</view>
			<view v-else class="empty">
				<xw-empty text="暂无选项" textColor="#777777"></xw-empty>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from "../uni-popup/uni-popup.vue"
	import uniNavBar from "../uni-nav-bar/uni-nav-bar.vue"
	import xwEmpty from "../xw-empty/xw-empty.vue"
	import uniSearchBar from '../uni-search-bar/uni-search-bar.vue'
	import uniLoadMore from "../uni-load-more/uni-load-more.vue"
	export default {
		name: 'zhilin-select',
		components: {
			uniPopup,
			uniNavBar,
			xwEmpty,
			uniSearchBar,
			uniLoadMore
		},
		props: {
			title: {
				type: String,
				default: '请选择'
			},
			value: {
				type: Boolean,
				required: true
			},
			data: {
				type: Array,
				required: true
			},
			multiple: {
				type: Boolean,
				default: true
			},
			showSearch: {
				type: Boolean,
				default: false
			},
			searchInput: Function,
			initSelected: Array
		},
		data() {
			return {
				list: [],
				selected: [],
				select: [],
				showBottom: false,
				loading: false,
				searchVal: ''
			}
		},
		created() {
			this.dataInit()
		},
		watch: {
			value(n, o) {
				if (n) this.$refs.popup.open()
				else this.$refs.popup.close()
			},
			data(n, o) {
				this.loading = false
				this.showBottom = false
				this.dataInit() 
			},
			searchVal(){
				this.inputSearch()
			},
			initSelected(n){
				this.selected = n
			}
		},
		methods: {
			lower: function(e) {
				this.showBottom = true
			},
			dataInit() {
				this.list = [] 
				this.selected = []
				this.select = []
				/* if (typeof this.data[0] == "string") {
					this.list = this.data.map((v, i) => ({
						label: v,
						value: v
					}))
				} else { */
					this.list = this.data
				/* } */
			},
			clickLeft() {
				this.$emit("input", false)
			},
			tapItem(val) {
				if (this.multiple) {
					let idx = this.selected.indexOf(val)
					let list = this.list
					if (idx == -1) {
						for(let i in this.list){
							if(list[i]['RowNumber'] == val){
								this.select.push(list[i])
								this.selected.push(val)
							}
						}
					} else {
						this.select.splice(idx, 1)
						this.selected.splice(idx, 1)
					}
				} else {
					this.selected = [val]
				}
				this.$emit("change", this.selected.join())
			},
			tapOK() {
				this.$emit("input", false)
				this.$emit("confirm", this.select)
			},
			popupChange(e) {
				this.$emit("input", e.show)
			},
			inputSearch() {
				let val = this.searchVal
				if(this.searchInput){
					this.loading = true
					this.searchInput(val)
					return
				}
				this.showBottom = false
				if(typeof this.data[0] == 'string'){
					this.list = this.data.filter(v=> v.indexOf(val)>-1).map((v, i) => ({
						label: v,
						value: v
					}))
				}else{
					this.list = this.data.filter(v=> v.label.indexOf(val)>-1)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifdef H5 || APP-PLUS*/
	.zhilin-picker {
		font-size: 28rpx;
		
		/deep/ .uni-popup__wrapper-box {
			background: #fff;
			height: 800rpx;
			margin-top: 21%;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			.uni-searchbar {
				padding: 16rpx 48rpx;
			}

			.main {
				height: calc(100% - 88rpx - 104rpx);
				flex: 1;
				position: relative;

				scroll-view {
					height: 100%;

					uni-view {
						box-sizing: border-box;
						padding: 18rpx 44rpx;
						display: flex;
						justify-content: space-between;
						align-items: center;
						/* min-height: 80rpx; */

						&.selected {
							background: rgba($uni-color-primary, .1);
						}

						uni-text {
							width: 85%;
						}
					}

					.isBottom {
						display: flex;
						justify-content: center;
						color: #777;
						position: relative;
						font-size: 24rpx;

						&::after {
							content: '';
							position: absolute;
							bottom: 10rpx;
							width: 60rpx;
							height: 4rpx;
							left: 50%;
							transform: translateX(-51%);
							background: #777;
						}
					}
				}

				.loadingBox {
					height: 100%;
					width: 100%;
					position: absolute;
					top: 0;
					left: 0;
					background: rgba(255, 255, 255, .7);
					z-index: 2;

					.uni-load-more {
						display: flex;
						justify-content: center;
						position: absolute;
						width: 100%;
						top: 35%;
						left: 50%;
						transform: translate(-50%);
					}
				}
			}
		}
	}

	/* #endif */

	/* #ifndef H5 */
	.zhilin-picker {
		font-size: 28rpx;

		uni-popup /deep/ .uni-popup {
			width: 750rpx;
			background: #fff;
			height: 1056rpx;
			overflow: hidden;
			display: flex;
			flex-direction: column;
		}

		uni-popup {
			.usb {
				padding: 0 32rpx;
				background: #fff;
			}

			.main {
				height: calc(1056rpx - 192rpx);
				flex: 1;
				position: relative;
				background: #fff;

				scroll-view {
					height: 100%;
					.scroll-view-item {
						box-sizing: border-box;
						/* padding: 18rpx 44rpx; */
						display: flex;
						justify-content: space-between;
						align-items: center;
						/* min-height: 80rpx; */

						&.selected {
							background: rgba($uni-color-primary, .1);
						}

						uni-text {
							width: 85%;
						}
					}

					.isBottom {
						display: flex;
						justify-content: center;
						color: #777;
						position: relative;
						padding: 18rpx 44rpx;
						font-size: 24rpx;

						&::after {
							content: '';
							position: absolute;
							bottom: 10rpx;
							width: 60rpx;
							height: 4rpx;
							left: 50%;
							transform: translateX(-51%);
							background: #777;
						}
					}
				}

				.loadingBox {
					height: 100%;
					width: 100%;
					position: absolute;
					top: 0;
					left: 0;
					background: rgba(255, 255, 255, .7);
					z-index: 2;

					uni-load-more {
						display: flex;
						justify-content: center;
						position: absolute;
						width: 100%;
						top: 35%;
						left: 50%;
						transform: translate(-50%);
					}
				}
			}

			.empty {
				height: calc(1056rpx - 192rpx);
				background: #fff;
			}
		}
	}

	/* #endif */
</style>
