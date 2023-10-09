import Request from '@/plugins/request/js/index';

export default {
    purchaseStockIn(params) {
        return Request().post('/api/stockBill/purchaseStockIn', {
            header: {
				contentType: 'application/json',
				accept: '*/*'
            },
			data: params
        });
    }
};
