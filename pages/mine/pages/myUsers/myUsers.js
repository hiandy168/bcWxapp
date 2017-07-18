// pages/mine/pages/myUsers/myUsers.js

var app = getApp()
Page({
  data:{
    ZERO : 0,
    hidden : false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    var com = wx.getStorageSync('com')
    // 获取 下级用户列表
    wx.request({
      url: app.globalData.http_header + 'index.php?m=User&a=fromlist&appjson=1&com=' + com,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
        }
        that.setData({
          rows : data.rows  
        })
      },
      complete : function (e){
        that.setData({hidden :true})
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})