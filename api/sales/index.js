import Request from '@/plugins/request/js/index';

export default {
    saleStockOut(params) {
        return Request().post('/api/stockBill/saleStockOut', {
            header: {
				contentType: 'application/json',
				accept: '*/*'
            },
			data: params
        });
    }
};
