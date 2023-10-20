import Request from '@/plugins/request/js/index';

export default {
	// 通用查询
	executeBillQuery(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
				"kdservice-sessionid": uni.getStorageSync('kdservice-sessionid'),
	        },
			data: params
	    });
	},// 登录
	validateUser(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.AuthService.ValidateUser.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
	        },
			data: params
	    });
	},// 保存
	kdSave(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Save.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
				"kdservice-sessionid": uni.getStorageSync('kdservice-sessionid'),
	        },
			data: params
	    });
	},// 提交
	kdSubmit(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Submit.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
				"kdservice-sessionid": uni.getStorageSync('kdservice-sessionid'),
	        },
			data: params
	    });
	},// 审核
	kdAudit(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Audit.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
				"kdservice-sessionid": uni.getStorageSync('kdservice-sessionid'),
	        },
			data: params
	    });
	},// 删除
	kdDelete(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Delete.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
				"kdservice-sessionid": uni.getStorageSync('kdservice-sessionid'),
	        },
			data: params
	    });
	},
	
	// 删除
	unAudit(params) {
	    return Request().post('/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.UnAudit.common.kdsvc', {
	        header: {
				"accept": '*/*',
				"contentType": 'application/json',
				"kdservice-sessionid": uni.getStorageSync('kdservice-sessionid'),
	        },
			data: params
	    });
	},
	//扫码
    barcodeScan(params) {
        return Request().post('/api/basic/barcodeScan', {
            header: {
				accept: '*/*'
            },
			data: params
        });
    },//扫库位码查询仓库
    selectFdCStockIdByFdCSPId(params) {
        return Request().get('/api/basic/selectFdCStockIdByFdCSPId', {
            header: {
				accept: '*/*'
            },
			data: params
        });
    },//扫码获取库存
    inventoryByBarcode(params) {
        return Request().get('/api/basic/inventoryByBarcode', {
            header: {
				accept: '*/*'
            },
			data: params
        });
    },
	//获取单号
	getBillNo(params) {
        return Request().get('/api/billList/getBillNo', {
            header: {
				accept: '*/*'
            },
			data: params
        });
    },
	//获取部门
	getDeptList(params) {
        return Request().post('/api/basic/deptList', {
            header: {
				contentType: 'application/json',
            },
			data: params
        });
    },//获取班次
	getShiftList(params) {
        return Request().post('/api/basic/shift', {
            header: {
				contentType: 'application/json',
            },
			data: params
        });
    },//获取班组
	getTeamList(params) {
        return Request().post('/api/basic/team', {
            header: {
				contentType: 'application/json',
            },
			data: params
        });
    },
	//获取权限
	getSysAuth(params) {
        return Request().get('/sysUser/getSysAuth', {
			data: params
        });
    },
	//获取菜单权限 
	getSysMenuById(params) {
        return Request().get('/sysMenu/getSysMenuById/'+ params);
    },
	//获取仓库
	getStockList(params) {
        return Request().post('/api/basic/stockList', {
            header: {
				contentType: 'application/json',
            },
			data: params
        });
    },//检验库存
	selectInvQty(params) {
        return Request().post('/api/invCheck/selectInvQty', {
            header: {
				contentType: 'application/json',
            },
			data: params
        });
    },
	//获取单据
	getOrderList(params) {
        return Request().post('/api/billList/queryBillList', {
            header: {
				contentType: 'application/json',
            },
			data: params
        });
    },
	//获取供应商
	supplierList(params) {
	    return Request().post('/api/basic/supplierList', {
	        header: {
				contentType: 'application/json',
	        },
			data: params
	    });
	},
	//获取客户
	customerList(params) {
	    return Request().post('/api/basic/customerList', {
	        header: {
				contentType: 'application/json',
	        },
			data: params
	    });
	},//获取职员
	getEmpList(params) {
	    return Request().post('/api/basic/empList', {
	        header: {
				contentType: 'application/json',
	        },
			data: params
	    });
	},
	//获取库存
	inventoryList(params) {
	    return Request().post('/api/basic/inventory', {
	        header: {
				contentType: 'application/json',
	        },
			data: params
	    });
	},//根据物料查库存 
	selectInvListByItemNumber(params) {
	    return Request().get('/api/invCheck/selectInvListByItemNumber', {
	        header: {
	       	 accept: '*/*'
	        },
			data: params
	    });
	},
	//获取更新
	getAndroidVersion(params) {
	    return Request().post('/api/basic/getAndroidVersion', {
	        header: {
				contentType: 'application/json',
	        },
			data: params
	    });
	},//打印次数
	barcodeScanCount(params) {
	    return Request().post('/api/basic/barcodeScanCount', {
	        header: {
				accept: '*/*'
	        },
			data: params
	    });
	},
};
