// pages/home/home.js
var loginer = require('../../utils/loginer.js')
var app = getApp()
Page({
  data:{
    hidden : true,
    lists : []
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    
    // 加载游戏列表
    wx.request({
      url:  app.globalData.http_header + 'index.php?m=Game&a=index&appjson=1',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
         'content-type': 'application/json'
      }, // 设置请求的 header
      success: function(res){
        // success 
        var data = res.data

        if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
        }
        
        that.setData({
          lists : data.rows
        })
      },
      fail : function (){
        console.log('fail')
      },
      complete : function (){
        console.log('complete')
      }
    })
    
  },
  onReady:function(){
    // 页面渲染完成
    var that = this
    var openid = wx.getStorageSync('userInfo').openid
    var login = loginer.createLoginer()
    login.getUserInfo(that)
  },
  onShow:function(){
    
  },
  北京 : function (e) {
    wx.navigateTo({
      url: '../beijing/beijing'
    })
  },
  加拿大 : function (e) {
    wx.navigateTo({
      url: '../canada/canada'
    })
  }
})