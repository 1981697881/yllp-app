import Request from '@/plugins/request/js/index';

export default {
    productStockIn(params) {
        return Request().post('/api/stockBill/productStockIn', {
            header: {
				contentType: 'application/json',
				accept: '*/*'
            },
			data: params
        });
    },
	pickingStockOut(params) {
        return Request().post('/api/stockBill/pickingStockOut', {
            header: {
				contentType: 'application/json',
				accept: '*/*'
            },
			data: params
        });
    }
};
