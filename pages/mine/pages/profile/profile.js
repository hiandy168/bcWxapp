// pages/mine/pages/profile/profile.js
var app = getApp()
Page({
  data:{
    userInfo : {
      avatarUrl : '',
      nickName : '',
      tel : '',
      email : '',
      wechat : '',
      alipay : ''
    },
    currentAvatarUrl : ''
  },
  onLoad:function(options){
    var that = this
    
    // 页面初始化 options为页面跳转所带来的参数
    that.getInfo(that)
  },
  getInfo : function (that){
    var com = wx.getStorageSync('com')
    wx.request({
      url: app.globalData.http_header + 'index.php?m=User&a=info&appjson=1&relation=1&com=' + com,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        // 设置用户数据
        var userInfo = wx.getStorageSync('userInfo')
        userInfo.realname = data.info.realname
        userInfo.tel = data.info.tel
        userInfo.wechat = data.info.wei_pay
        userInfo.alipay = data.info.ali_pay
        userInfo.email = data.info.email
        that.setData({ 
          userInfo : userInfo,
          currentAvatarUrl : userInfo.avatarUrl
        })
      
      },
      fail: function() {
        // fail
        var userInfo = wx.getStorageSync('userInfo')
        that.setData({ 
          userInfo : userInfo,
          currentAvatarUrl : userInfo.avatarUrl
        })
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
  },
  chooseAvatar : function (e){
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({ currentAvatarUrl : tempFilePaths })
      }
    })
  },
  xiugai : function(e){
    var that = this

    that.data.userInfo.realname = e.detail.value.realname
    that.data.userInfo.alipay = e.detail.value.alipay
    that.data.userInfo.wechat = e.detail.value.wechat
    that.data.userInfo.email = e.detail.value.email
    that.data.userInfo.tel = e.detail.value.tel

    // 发送更新请求
    var com = wx.getStorageSync('com')
    
    wx.request({
      url: app.globalData.http_header + 'index.php?m=User&a=add&act=edit&appjson=1&com=' + com,
      data: {
        realname : e.detail.value.realname,
        email : e.detail.value.email,
        ali_pay : e.detail.value.alipay,
        tel : e.detail.value.tel,
        wei_pay : e.detail.value.wechat
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        that.setData({ userInfo : that.data.userInfo })
        wx.setStorageSync('userInfo', that.data.userInfo)
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail : function (){
        wx.showToast({
          title: '更新失败！',
          icon: 'success',
          duration: 1000
        })
      }
    })
  }

})