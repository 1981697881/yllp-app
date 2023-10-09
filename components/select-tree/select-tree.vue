<template>
    <view id="section_ul" class="selectTrees">
        <!-- 一级分支 -->
        <view class="lv1list" v-for="(item, index) in selectList" :key="index">
            <view class="tree-one">
                <!-- 单选框组件 -->
                <checkbox-group v-if="showCheck"
                    style="position: absolute;height: 80rpx;line-height: 80rpx; left:20rpx;z-index: 1;">
                    <checkbox :checked="item.checked" @click="_chooseAll(item,index)" />
                </checkbox-group>
                <!-- 名字和iconfont -->
                <label style="height:80rpx;display: flex;align-items: center;padding: 20rpx;position: relative;border-bottom: 1px solid #e4e4e4;background: #f3f3f3;"
                    @click="_showlv2(index)">
                    <view class="itemT">{{item.name}}</view>
                    <view class="deleteBtn" v-if="showDelete" @click.stop="deleteItem(item)">删除</view>
                    <i class="iconfont cuIcon-unfold" v-if="item.show"
                        style="position: absolute;top: 18%;right: 2%;font-size: 48rpx;"></i>
                    <i class="iconfont cuIcon-fold" v-else
                        style="position: absolute;top: 18%;right: 2%;font-size: 48rpx;"></i>
                </label>
            </view>
            <!-- 二级分支 -->
            <view v-if='item.show && item.childrenList '>
                <view class="tree-two" v-for="(item2, index2) in item.childrenList" :key="index2"
                    style="display: flex;">
                    <view class="aui-list-item-inner flexIn">
                        <checkbox-group v-if="showCheck">
                            <checkbox v-if="!disableLv2Check" :checked="item2.checked"
                                @click="_chooseOne(index,index2)" />
                            <checkbox :checked="item2.checked" disabled="true" v-else />
                        </checkbox-group>
                        <label style="font-size: 28rpx;">{{item2.name}}</label>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "select-tree",
    data() {
        return {
            finalList: [],
            menuKey: 1,
            selectList: this.value
        };
    },
    props: {
        // selectList,
        value: {
            type: Array,
            default: function () {
                return [
                    {
                        name: "水果",
                        checked: false,
                        show: true,
                        childrenList: [
                            {
                                checked: false,
                                name: "西瓜"
                            },
                            {
                                checked: false,
                                name: "桃子"
                            }
                        ]
                    },
                    {
                        name: "工具",
                        checked: false,
                        show: false,
                        childrenList: [
                            {
                                checked: false,
                                name: "锄头"
                            },
                            {
                                checked: false,
                                name: "铲子"
                            }
                        ]
                    }
                ];
            }
        },
        showCheck: {
            //显示多选框
            type: Boolean,
            default: true
        },
        disableLv2Check: {
            //让二级标题不可选中
            type: Boolean,
            default: false
        },
        showDelete: {
            //显示删除按钮
            type: Boolean,
            default: false
        }
    },
    mounted() {
        // console.log(this.value)
        // setTimeout(()=>{
        //      this.selectList = this.value
        // })

        // this.$forceUpdate()
    },
    methods: {
        _showlv2(index) {
            // console.log('showLv2............................', index)
            //展开二级目录
            if (this.selectList[index].show) {
                this.$set(this.selectList[index], "show", false);
				this.$forceUpdate()
                this.$emit('input', this.selectList)
            } else {
                this.$set(this.selectList[index], "show", true);
				this.$forceUpdate()
                this.$emit('input', this.selectList)
            }
        },
        _chooseAll(item, index) {
            //选中一级目录的所有
            if (this.selectList[index].checked) {
                //
                this.$set(this.selectList[index], "checked", false);
                this.selectList[index].childrenList.forEach(item => {
                    item.checked = false;
                });
                this.$emit('input', this.selectList)
            } else {
                this.$set(this.selectList[index], "checked", true);
                this.selectList[index].childrenList.forEach(item => {
                    item.checked = true;
                });
                this.$emit('input', this.selectList)
            }
            this.$set(this.selectList[index], "show", true);
            this.$emit('input', this.selectList)
            this.$forceUpdate();
            this._computedFinalList();
        },
        _chooseOne(i1, i2) {
            if (this.selectList[i1].childrenList[i2].checked) {
                //去掉勾选
                this.$set(this.selectList[i1], "checked", true);
                this.$set(this.selectList[i1].childrenList[i2], "checked", false);
				if (
				    this.selectList[i1].childrenList.every(item => item.checked == false)
				) {
				    //判断是否全部都是选中
				    this.$set(this.selectList[i1], "checked", false);
				}
                this.$forceUpdate();
                this.$emit('input', this.selectList)
                this._computedFinalList();
            } else {
                //增加勾选
                this.$set(this.selectList[i1], "checked", true);
                this.$set(this.selectList[i1].childrenList[i2], "checked", true);
                if (
                    this.selectList[i1].childrenList.every(item => item.checked == true)
                ) {
                    //判断是否全部都是选中
                    this.$set(this.selectList[i1], "checked", true);
                }
                this.$emit('input', this.selectList)
                this.$forceUpdate();
                this._computedFinalList();
            }
        },
        _computedFinalList() {
            //计算最终的值
            this.finalList = [];
			this.selectList.forEach(item=>{
				if(item.checked){
					this.finalList.push(JSON.parse(JSON.stringify(item))) //对象深拷贝 不然原数据会发生变化
				}
			})
			this.finalList.forEach(item=>{
				item.childrenList.forEach((item2,index2)=>{
					if(!item2.checked){
						item.childrenList.splice(index2,1)
					}
				})
			})
            this.$emit("choose", this.finalList);
        },
        chooseAll() {
            //选中页面所有层级
            this.selectList.forEach(item => {
                this.$set(item, "checked", true);
                item.childrenList.forEach(item2 => {
                    this.$set(item2, "checked", true);
                });
            });
            this.$emit('input', this.selectList)
            this.$forceUpdate();
            this._computedFinalList();
        },
        cancelAll() {
            //取消选中页面所有层级
            this.selectList.forEach(item => {
                this.$set(item, "checked", false);
                item.childrenList.forEach(item2 => {
                    this.$set(item2, "checked", false);
                });
            });
            this.$emit('input', this.selectList)
            this.$forceUpdate();
            this._computedFinalList();
        },
        deleteItem(item) {
            //删除选中项目
            this.$emit('input', this.selectList)
            this.$emit("deleteItem", item);
        }
    },
    watch: {
        value(res) {
            this.selectList = res
            this.$emit('input', this.selectList)
        }
    },
};
</script>

<style lang="scss" scoped>
* {
    font-size: 32rpx;
}

/* #ifdef APP-PLUS*/
.selectTrees{
    margin-bottom: 180rpx;
}
/* #endif */

.deleteBtn {
    position: absolute;
    right: 10%;
    background: #f97979;
    padding: 2rpx 16rpx;
    color: white;
    border-radius: 4rpx;
    font-size: 28rpx;
}

.itemT {
    margin-left: 60rpx;
    font-size: 32rpx;
    width: 65%;
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.tree-two {
    padding: 20rpx 68rpx;
    background: white;
    border-bottom: 2rpx solid #e2e2e2;
    font-size: 28rpx;
}

.flexIn {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    align-content: center;
    flex-wrap: nowrap;
    width: 100%;
}


</style>
