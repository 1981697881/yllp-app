<template>
	<view>
	<cu-custom bgColor="bg-gradual-blue" :isBack="true"><block slot="backText">返回</block><block slot="content">车间管理</block></cu-custom>
	<scroll-view scroll-y class="page">
		<view class="nav-list">
			<navigator hover-class='none' :url="'/pages/component/workshop/' + item.path+ (item.source != null?'?source='+item.source: '')" class="nav-li" navigateTo :class="'bg-'+item.color"
			  v-for="(item,index) in elements" :key="index">
				<view class="nav-title text-center">{{item.name}}</view>
				<text :class="'cuIcon-' + item.cuIcon"></text>
			</navigator>
		</view>
		<view class="cu-tabbar-height"></view>
	</scroll-view>
	</view>
</template>
<script>
	import basic from '@/api/basic';
	export default {
		data() {
			return {
				elements: [
					/* {
						title: '派工',
						name: 'bar',
						color: 'cyan',
					},
					{
						title: '工序汇报',
						name: 'nav',
						color: 'cyan',
					},{
						title: '工序委外发出',
						name: 'nav',
						color: 'cyan',
					},{
						title: '工序委外接收',
						name: 'nav',
						color: 'cyan',
					}, */
				],
			};
		},
		onLoad: function (option) {
			let me = this
			if(JSON.stringify(option) != "{}"){
				basic.getSysMenuById(option.id).then(rest => {
				let data = rest.data
				this.elements = data
			})
		  }
		},
		methods: {
		
		}
	}
</script>

<style>
	.page {
		height: 100vh;
	}
	.nav-list {
		margin-top: 5%;
	}
	.nav-title::first-letter {
		font-size: 16px;
		margin-right: 2px;
	}
</style>
