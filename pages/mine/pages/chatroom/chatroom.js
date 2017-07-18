// pages/mine/pages/chatroom1/chatroom1.js
var util =  require('../../../../utils/util.js')
var messager =  require('../../../../utils/message.js')
var user =  require('../../../../utils/user.js')
var tool =  require('../../../../utils/tools.js')
var strophe = require('../../../../utils/strophe.js')
var WebIM = require('../../../../utils/WebIM.js')
var WebIM = WebIM.default

var loginer = require('../../../../utils/loginer.js')

var app = getApp()
Page({
  data:{
    inputText : "", //输入框内
    messages : [],
    username : null,
    CFG_OPENID : null
  },
  onLoad:function(options){
    
    var that = this

    // 设置管理员账号
    that.data.CFG_OPENID = wx.getStorageSync('CFG_OPENID')
    
    // 设置聊天框高度
    var x = 750 * app.globalData.systemInfo.windowHeight/app.globalData.systemInfo.windowWidth
    if(app.globalData.systemInfo.system.substr(0,3) == 'iOS'){
      that.setData({ scrollHeight : x - 126  })
    }else{
      that.setData({ scrollHeight : x })
    }   

    // 设置用户名 普通用户
    if(options.username)  {   // 管理员

      that.setData({
        username :  JSON.parse(options.username)
      })
      wx.setNavigationBarTitle({
        title: options.nickname
      })
      
      // 由会话界面跳转而来 
      var msges = wx.getStorageSync(that.data.username.your.toLowerCase() + wx.getStorageSync('userInfo').openid)
      if(msges){
          console.log(msges)
          var arr = []
          for(var i=0;i<msges.length;i++){
            var temp = msges[i]
            if(temp.msg){ 
              let tem = temp.message
              arr.push(tem)
            }else{
              arr.push(temp)
            } 
        }
        that.setData({
          messages :arr
        })
      }
    
  
      // 设置滚动
      var txtHeight = 0
      for(var i = 0;i<that.data.messages.length;i++){
        txtHeight += that.data.messages[i].textHeight 
      }
      var deltaH  = txtHeight - that.data.scrollHeight
      if(deltaH > 0){
        that.setData({scrollTop : deltaH })
      }

    }else { // 普通用户

      var adminmsg = wx.getStorageSync('adminmsg')
      console.log(adminmsg)
      if(adminmsg){
          var arr = []
          for(var i=0;i<adminmsg.length;i++){
            var temp = adminmsg[i]
            if(temp.message){
              let tem = temp.message
              arr.push(tem)
            }else{
              arr.push(temp)
            } 
          }
          that.setData({
            messages :arr
          })
        // 设置滚动
        var txtHeight = 0
        for(var i = 0;i<that.data.messages.length;i++){
          txtHeight += that.data.messages[i].textHeight 
        }
        var deltaH  = txtHeight - that.data.scrollHeight
        if(deltaH > 0){
          that.setData({scrollTop : deltaH })
        }
      }
    }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var that = this
    var openid = wx.getStorageSync('userInfo').openid
    var login = loginer.createLoginer()
    login.loginHuanxin(openid,that)
    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  formSubmit : function(e){ // 发送消息
    var that = this
    if(e.detail.value.value.length > 0){  // 有文字
      // 计算文本高度    
      var textHeight = tool.getTextWidth(e.detail.value.value, (750 - 60)*0.8*0.8 - 36, 28, 32)
      var user =  wx.getStorageSync('userInfo')
      var message = messager.createMessage({
        type1 : "right",
        content : [{data : e.detail.value.value}] ,
        CTime : util.formatTime(new Date()),
        user : user,
        textHeight : textHeight + 36 + 60,
      })
      that.data.messages.push(message)
      that.setData({
        messages : that.data.messages,
        inputText : "",
      })

      var txtHeight = 0
      for(var i = 0;i<that.data.messages.length;i++){
        txtHeight += that.data.messages[i].textHeight 
      }
      var deltaH  = txtHeight - that.data.scrollHeight
      if(deltaH > 0){
        that.setData({scrollTop : deltaH })
      }

      // 环信发送消息
      var id = WebIM.conn.getUniqueId();
      var msg = new WebIM.message('txt', id);

      msg.set({
          msg:  e.detail.value.value,
          to : that.data.username ? that.data.username.your : that.data.CFG_OPENID,
          roomType: false,
          chatType: 'singleChat',
          ext : {
            user : user
          },
          success: function (id, serverMsgId) {
              console.log('send room text success');
          },
          fail: function () {
              console.log('failed');
          }
      });
      
      WebIM.conn.send(msg.body);
       // 储存消息 
      if(wx.getStorageSync('userInfo').openid == wx.getStorageSync('CFG_OPENID')){ //管理员
        
        var chatMsg = app.globalData.chatMsg || []
        var msgData = {
            info: {
                from: that.data.username.your,
                to: wx.getStorageSync('userInfo').openid
            },
            username: that.data.username.your,
            yourname: that.data.username.your,
            msg: {
                type: 'txt',
                data: message.content
            },
            style: '',
            CTime: message.CTime,
            mid: 'txt' + message.CTime,
            message : message
        }
        chatMsg = wx.getStorageSync(that.data.username.your.toLowerCase() + wx.getStorageSync('userInfo').openid) || []
        chatMsg.push(msgData)
        wx.setStorage({
            key: that.data.username.your.toLowerCase() + wx.getStorageSync('userInfo').openid,
            data: chatMsg,
            success: function () {
                //console.log('success')
            }
        })
        
        // 储存member 
        // {openid avatarUrl nickName}
        var member =  wx.getStorageSync('member') || []
        for(var i = 0; i < member.length; i++){
            if(member[i].openid == that.data.username.your.toLowerCase()) {
                
                var removed = member.splice(i,1);
                var item = {
                  openid : that.data.username.your.toLowerCase(),
                  avatarUrl : that.data.username.avatarUrl,
                  nickName : that.data.username.nickName
                }
                member.unshift(item)
                wx.setStorageSync('member', member)
                if(message.data.length > 0 && chat){  // 有文字
                    chat.onLoad(chatMsg,that.data.username.your.toLowerCase() + wx.getStorageSync('userInfo').openid)
                }    
                return
            }
        }
        var item = {
                  openid : that.data.username.your.toLowerCase(),
                  avatarUrl : that.data.username.avatarUrl ,
                  nickName : that.data.username.nickName
                }
        member.unshift(item)
        wx.setStorageSync('member', member)

      }else { //普通用户
         
         var chatMsg = app.globalData.chatMsg || []
          var msgData = {
            info: {
                from: wx.getStorageSync('userInfo').openid,
                to: that.data.CFG_OPENID
            },
            username: wx.getStorageSync('userInfo').openid,
            yourname: wx.getStorageSync('userInfo').openid,
            msg: {
                type: 'txt',
                data: message.content
            },
            style: '',
            CTime: message.CTime,
            mid: 'txt' + message.CTime,
            message : message
        }
        chatMsg = wx.getStorageSync('adminmsg') || []
        chatMsg.push(msgData)
        wx.setStorage({
            key: 'adminmsg',
            data: chatMsg,
            success: function () {
                //console.log('success')
            }
        })

      }
    }
  },
  finish:function (e){
    var that = this
    e.detail.value = {value : e.detail.value}
    that.formSubmit(e) 
  },
  receiveMsg: function (msg, type) {
      var that = this

      if(that.data.username){ // 判断是否是自己的消息 然后显示
        if(that.data.username.your.toLowerCase() != msg.ext.user.openid.toLowerCase()){
          return
        }
      }
      console.log(msg.data)
      if(msg.data.length > 0 ){  // 有文字
        // 计算文本高度    
        var textHeight = tool.getTextWidth(msg.data, (750 - 60)*0.8*0.8 - 36, 28, 32)
        var message = messager.createMessage({
          type1 : msg.from == wx.getStorageSync('userInfo').openid ? 'right' : "left",
          content : [{data : msg.data}],
          CTime : util.formatTime(new Date()),
          user : msg.ext.user,
          textHeight : textHeight + 36 + 60,
        })
        that.data.messages.push(message)
        that.setData({
          messages : that.data.messages,
          inputText : "",
        })

        var txtHeight = 0
        for(var i = 0;i<that.data.messages.length;i++){
          txtHeight += that.data.messages[i].textHeight 
        }
        var deltaH  = txtHeight - that.data.scrollHeight
        if(deltaH > 0){
          that.setData({scrollTop : deltaH })
        }
      }
  }
})