import Request from '@/plugins/request/js/index';

export default {
	//获取汇报列表
    productWorkReport(params, data) {
       return Request().post('/productWorkReport/list/'+data.pageNum+'/'+data.pageSize, {
           header: {
       		contentType: 'application/json',
       		accept: '*/*'
           },
       	data: params
       });
    },//获取派工列表
    productWorkDispatch(params, data) {
       return Request().post('/productWorkDispatch/list/'+data.pageNum+'/'+data.pageSize, {
           header: {
       		contentType: 'application/json',
       		accept: '*/*'
           },
       	data: params
       });
    },
	//汇报保存
    productWorkReportAdd(params, data) {
       return Request().post('/productWorkReport/add', {
           header: {
       		contentType: 'application/json',
       		accept: '*/*'
           },
       	data: params
       });
    },//工序派工
    productWorkInsert(params, data) {
       return Request().post('/api/workRep/insert', {
           header: {
       		contentType: 'application/json',
       		accept: '*/*'
           },
       	data: params
       });
    },
	//派工保存
    productWorkDispatchAdd(params, data) {
       return Request().post('/productWorkDispatch/add', {
           header: {
       		contentType: 'application/json',
       		accept: '*/*'
           },
       	data: params
       });
    },//获取工序
    formatByProductWork(params) {
       return Request().get('/process/formatByProductWork', {
           header: {
       		accept: '*/*'
           },
       	data: params
       });
    },
};
