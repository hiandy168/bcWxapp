
var app = getApp()
Page({
	onLoad: function (options) {
		
		var that = this

		var com = wx.getStorageSync('com')
		
		this.setData({
			com: com,
			uid : wx.getStorageSync('userInfo').openid

		});
	}
		
});