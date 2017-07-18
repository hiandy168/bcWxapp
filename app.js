//app.js
var messager =  require('./utils/message.js')
const utils = require('./utils/util.js')
var tool =  require('./utils/tools.js')
var strophe = require('./utils/strophe.js')
var WebIM = require('./utils/WebIM.js')
// var loginer = require('./utils/loginer.js')
var WebIM = WebIM.default

App({
    getRoomPage: function (city) {
        var urlPath = "pages/"+city+"/"+ city
        return this.getPage(urlPath)
    },
    getPage: function (pageName) {
        var pages = getCurrentPages()
        return pages.find(function (page) {
                return page.__route__ == pageName
        })
    },
    onLaunch: function() {
        var that = this
        // 获取设备信息
        wx.getSystemInfo({
            success: function(res) {
                
                that.globalData.systemInfo = { 
                    'pixelRatio' : res.pixelRatio,
                    'windowWidth' : res.windowWidth,
                    'windowHeight' : res.windowHeight,
                    'sizePixelRatio' : 750/res.windowWidth,
                    'system' : res.system
                }	
            }
        })

		// 环信配置
        WebIM.conn.listen({
            //连接成功回调
            onOpened: function (message) {
                console.log("onOpened")
                // 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
                // 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
                // 则无需调用conn.setPresence();   
                WebIM.conn.setPresence()
                // WebIM.conn.getRoster(rosters)
            },
            // 连接断开
            onClosed : function (message) {
                console.log("onClosed")
                var userInfo = wx.getStorageSync('userInfo')
                var options = {
                    apiUrl: WebIM.config.apiURL,
                    user: userInfo.openid,
                    pwd: md5.hex_md5(userInfo.openid),
                    appKey: WebIM.config.appkey,
                    grant_type: "password"
                }
                WebIM.conn.open(options) 
            },
            //收到文本消息
            onTextMessage: function (message) {
                console.log('onTextMessage')
                
                var page = null
                var chat = that.getPage('pages/mine/pages/chat/chat')
                if(message.type == "chat") {//"chat"  单聊
                     
                    // 发送消息
                    page = that.getPage('pages/mine/pages/chatroom/chatroom')
                    if(message.data.length > 0 && page){  // 有文字
                        page.receiveMsg(message,message.type)
                    }  
                    // 储存消息
                    if(wx.getStorageSync('userInfo').openid == wx.getStorageSync('CFG_OPENID')){ // 管理员    
                        
                        var chatMsg = that.globalData.chatMsg || []
                        var value = WebIM.parseEmoji(message.data.replace(/\n/mg, ''))
                        console.log(message.ext.user)

                        var textHeight = tool.getTextWidth(value, (750 - 60)*0.8*0.8 - 36, 28, 32)
                        var msg = messager.createMessage({
                            type1 : "left",
                            content : value,
                            CTime : utils.formatTime(new Date()),
                            user : message.ext.user,
                            textHeight : textHeight + 36 + 60,
                        })

                        chatMsg = wx.getStorageSync(message.from + wx.getStorageSync('userInfo').openid) || []
                        chatMsg.push(msg)
                        wx.setStorage({
                            key: message.from + wx.getStorageSync('userInfo').openid,
                            data: chatMsg,
                            success: function () {
                                //console.log('success')
                            }
                        })
                        var member =  wx.getStorageSync('member') || []
                        for(var i = 0; i < member.length; i++){
                            if(member[i].openid == message.from.toLowerCase()) {
                                
                                var removed = member.splice(i,1);
                                var item = {
                            openid : message.from.toLowerCase(),
                            avatarUrl : msg.user.avatarUrl,
                            nickName : msg.user.nickName
                        }
                                member.unshift(item)
                                wx.setStorageSync('member', member)
                                if(message.data.length > 0 && chat){  // 有文字
                                    chat.onLoad(chatMsg,message.from.toLowerCase() + wx.getStorageSync('userInfo').openid)
                                }    
                                return
                            }
                        }
                         var item = {
                            openid : message.from.toLowerCase(),
                            avatarUrl : msg.user.avatarUrl,
                            nickName : msg.user.nickName
                        }
                        member.unshift(item)
                        wx.setStorageSync('member', member)

                        // 设置加载信息
                        if(message.data.length > 0 && chat){  // 有文字
                            chat.onLoad(chatMsg,message.from.toLowerCase() + wx.getStorageSync('userInfo').openid)
                        } 

                    }else {  // 普通用户
                        
                        var chatMsg = that.globalData.chatMsg || []
                        var value = WebIM.parseEmoji(message.data.replace(/\n/mg, ''))
                        var time = WebIM.time()


                        var textHeight = tool.getTextWidth(value, (750 - 60)*0.8*0.8 - 36, 28, 32)
                        var msg = messager.createMessage({
                            type1 : "left",
                            content : value,
                            CTime : utils.formatTime(new Date()),
                            user : message.ext.user,
                            textHeight : textHeight + 36 + 60,
                        })

                        chatMsg = wx.getStorageSync('adminmsg') || []
                        chatMsg.push(msg)
                        wx.setStorage({
                            key: 'adminmsg',
                            data: chatMsg,
                            success: function () {
                                //console.log('success')
                            }
                        })
                    }
                     
                }else{ //"groupchat" 群聊
                    var page = null
                    if(message.to == wx.getStorageSync('beijinggroupid')){ // 北京
                        page = that.getRoomPage('beijing')
                   
                    }else if(message.to == wx.getStorageSync('canadagroupid')){
                        page = that.getRoomPage('canada')
                   
                    }else {
                   
                        return
                    }
                    if(message.data.length > 0 && page){  // 有文字
                        page.receiveMsg(message,message.type)
                   
                    }
                }
                 

                
            },
            // 各种异常
            onError: function (error) {
                console.log("onError")

                // 16: server-side close the websocket connection
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_DISCONNECTED) {
                
                    if (WebIM.conn.autoReconnectNumTotal < WebIM.conn.autoReconnectNumMax) {
                        return;
                    }
                    
                    wx.showToast({
                        title: '服务端关闭了websocket链接',
                        duration: 1000
                    });
                    return;
                }

                // 8: offline by multi login
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_ERROR) {
                    wx.showToast({
                        title: '远程登录！被下线',
                        duration: 1000
                    })
                    return;
                }

                // 客户端网络中断
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_CLOSE_ERROR) {
                    wx.showToast({
                        title: '客户端网络中断',
                        duration: 1000
                    })
                    return;
                }

                // 客户端断线
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_CLIENT_OFFLINE) {
                    wx.showToast({
                        title: '客户端网络中断',
                        duration: 1000
                    })
                    return;
                }

                // 客户端网络中断
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_CLOSE_ERROR) {
                    wx.showToast({
                        title: '客户端网络中断',
                        duration: 1000
                    })
                    return;
                }

                // 客户端网络中断
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_CLOSE_ERROR) {
                    wx.showToast({
                        title: '客户端网络中断',
                        duration: 1000
                    })
                    return;
                }
            }
		  })
		
    },
    onShow: function() {  
        // 页面显示
        var that = this
        that.getAdminID(that)
    },
    getAdminID : function (that){
        
        wx.request({
            url: that.globalData.http_header + 'index.php?appjson=1&m=Setting&a=index&gid=1',
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
                // success        
                wx.setStorageSync('CFG_OPENID', res.data.CFG_OPENID) 
            }
        })
  },
    onHide: function() {
      // Do something when hide.
      WebIM.conn.close();
      console.log("hidden")
    },
    globalData:{
        userInfo : {
            avatarUrl : '',
            nickName : '',
            tel : '',
            email : '',
            wechat : '',
            alipay : '',
            openid : '',
            groupid : ''
        },
        systemInfo : {
            'pixelRatio' : 0,
            'windowWidth' : 0,
            'windowHeight' : 0,
            'sizePixelRatio' : 0,
            'system' : ''
        },
        appid : 'wxc0a560214b8483a2',
        secret : '6f0afa70b438bf0b764d43d7a0b7aff2',
        grant_type : 'authorization_code',
        http_header : 'https://app.zhaokaiyu.com/'

        // old 
        // wx805a53ed10908fb2
        // 233b0f975235574db84796fd1d0c703e

        // appid ： wxc0a560214b8483a2
        // secret ： 6f0afa70b438bf0b764d43d7a0b7aff2
        
    }
   
})
