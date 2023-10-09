<template>
	<view>
	<cu-custom bgColor="bg-gradual-blue" :isBack="true"><block slot="backText">返回</block><block slot="content">委外</block></cu-custom>
	<scroll-view scroll-y class="page">
		<view class="nav-list">
			<navigator hover-class='none' :url="'/pages/component/outsourcing/' + item.url+ (item.source != null?'?source='+item.source: '')" class="nav-li" navigateTo :class="'bg-'+item.color"
			 :style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]" v-for="(item,index) in elements" :key="index">
				<view class="nav-title">{{item.title}}</view>
				<view class="nav-name">{{item.name}}</view>
				<text :class="'cuIcon-' + item.cuIcon"></text>
			</navigator>
		</view>
		<view class="cu-tabbar-height"></view>
	</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				elements: [{
						title: '有源单',
						name: '委外发出',
						url: 'emitActive',
						color: 'blue',
						cuIcon: 'vipcard'
					},
					{
						title: '无源单',
						name: '委外发出',
						url: 'emitPassive',
						color: 'blue',
						cuIcon: 'vipcard'
					},{
						title: '有源单',
						name: '委外入库',
						url: 'storageActive',
						color: 'blue',
						cuIcon: 'vipcard'
					},
					{
						title: '无源单',
						name: '委外入库',
						url: 'storagePassive',
						color: 'blue',
						cuIcon: 'vipcard'
					},
				],
			};
		},
		methods: {
		
		}
	}
</script>
<style>
	.page {
		height: 100vh;
	}
	.nav-list{
		margin-top: 5%;
	}
	.nav-title::first-letter {
	    font-size: 16px;
	    margin-right: 2px;
	}
</style>
