import Request from '@/plugins/request/js/index';

export default {
	//扫码
    barcodeScan(params) {
        return Request().get('/api/inventory/barcodeScan', {
            header: {
				accept: '*/*'
            },
			data: params
        });
    },
	//上架
	onFrame(params) {
	    return Request().post('/api/inventory/onFrame', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//下架
	underFrame(params) {
	    return Request().post('/api/inventory/underFrame', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//盘点方案
	invProject(params) {
	    return Request().post('/api/invCheck/invProject', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//库存盘点
	invCheckQty(params) {
	    return Request().post('/api/invCheck/invCheckQty', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//盘点方案明细
	invCheckList(params) {
	    return Request().post('/api/invCheck/invCheckList', {
	        header: {
				accept: '*/*'
	        },
			data: params
	    });
	},
	//盘点方案查询盘点仓库
	invProjectList(params) {
	    return Request().post('/api/invCheck/invProjectList', {
	        header: {
				accept: '*/*'
	        },
			data: params
	    });
	},
	//盘亏单
	invLossStockOut(params) {
	    return Request().post('/api/stockBill/invLossStockOut', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//盘盈单
	invProFitStockOut(params) {
	    return Request().post('/api/stockBill/invProFitStockOut', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//调拨单
	addTrans(params) {
	    return Request().post('/api/stockBill/addTrans', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//其他入库
	otherStockIn(params) {
	    return Request().post('/api/stockBill/otherStockIn', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
	//其他出库
	otherStockOut(params) {
	    return Request().post('/api/stockBill/otherStockOut', {
	        header: {
				contentType: 'application/json',
				accept: '*/*'
	        },
			data: params
	    });
	},
};
