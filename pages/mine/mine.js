// pages/mine/mine.js
var loginer = require('../../utils/loginer.js')
var app = getApp()
Page({
  data:{
    userInfo: {
      avatarUrl : '',
      nickName : '',
      tel : '',
      email : '',
      wechat : '',
      alipay : ''
    },
    items: [{
        icon: '../../assets/images/iconfont-order.png',
        text: '我的资料',
        path: './pages/profile/profile'
      }, {
        icon: '../../assets/images/iconfont-addr.png',
        text: '成长度',
        path: './pages/detail/detail'
      }, {
        icon: '../../assets/images/iconfont-addr.png',
        text: '记录',
        path: './pages/nper/nper'
      },{
        icon: '../../assets/images/iconfont-addr.png',
        text: '工具参数',
        path: './pages/odds/odds'
      },{
        icon: '../../assets/images/iconfont-addr.png',
        text: '工具说明',
        path: './pages/rules/rules'
      }, 
      {
        icon: '../../assets/images/iconfont-addr.png',
        text: '扫码分享',
        path: './pages/QRCode/QRCode'
      }, 
      {
        icon: '../../assets/images/iconfont-addr.png',
        text: '下级用户',
        path: './pages/myUsers/myUsers'
      },
      {
        icon: '../../assets/images/iconfont-addr.png',
        text: '联系客服',
        path: './pages/chatroom/chatroom'
      }]
  },
  onLoad:function(options){
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  
  onShow:function(){
    var that = this
    var option = null
    if(wx.getStorageSync('userInfo').openid == wx.getStorageSync('CFG_OPENID')){ //管理员
      that.data.items[7].text = '客户消息'
      that.data.items[7].path = './pages/chat/chat'
    }else { // 用户
      that.data.items[7].text = '联系客服'
      that.data.items[7].path = './pages/chatroom/chatroom'
    }
    
    that.setData({ items : that.data.items })
  

    // 设置用户数据
    var userInfo = wx.getStorageSync('userInfo')
    that.setData({ userInfo : userInfo })

    // 登录
    var openid = wx.getStorageSync('userInfo').openid
    var login = loginer.createLoginer()
    if(!openid){
        console.log('!oepnid')
        login.getUserInfo(that)
    }else {
        console.log('oepnid')
        login.loginHuanxin(openid,that)
    }

    // 获取用户最新信息
    that.getUserInfo(that)

  },
  getUserInfo : function (that){
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
        that.setData({
          score : data.info.price == null ? "0.00" : data.info.price,
          from_id : data.info.from_id
        }) 
      },
      complete : function (){
        that.setData({ hidden : true})
      }
    })

    wx.request({
      url: app.globalData.http_header + 'index.php?m=User&a=getfrominfo&appjson=1&com=' + com, 
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        that.setData({ formId : res.data.message ? res.data.message : ((res.data.info.realname == null || res.data.info.realname == "" || res.data.info.realname == "0" || res.data.info.realname == undefined) ? "昵称暂空": res.data.info.realname) }) 
      }
    })

  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  navigateTo(e) {
    wx.navigateTo(e)
  }
})