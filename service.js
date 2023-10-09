// 管理账号信息
const USERS_KEY = 'USERS_KEY';
const URL_KEY = 'URL_KEY';

const getUsers = function() {
	let ret = '';
	ret = uni.getStorageSync(USERS_KEY);
	if (!ret) {
		ret = '[]';
	}
	return JSON.parse(ret);
}
const getUrls = function() {
	let ret = '';
	ret = uni.getStorageSync(URL_KEY);
	if (!ret) {
		ret = '{}';
	}
	return JSON.parse(ret);
}
const addUser = function(userInfo) {
	let users = getUsers();
	users.push({
		account: userInfo.account,
		password: userInfo.password,
		userId: userInfo.userId,
		username: userInfo.username,
	});
	uni.setStorageSync(USERS_KEY, JSON.stringify(users));
}
const addUrl = function(url) {
	let urls = getUrls();
	urls.url = url;
	uni.setStorageSync(URL_KEY, JSON.stringify(urls));
}
const clearUser = function(userInfo) {
	uni.removeStorageSync(USERS_KEY);
}
const clearUrl = function(url) {
	uni.removeStorageSync(URL_KEY);
}

export default {
	getUsers,
	clearUser,
	addUser,
	getUrls,
	addUrl,
	clearUrl
}
