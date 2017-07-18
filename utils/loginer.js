var strophe = require('./strophe.js')
var md5 = require('./md5.js')
var WebIM = require('./WebIM.js')
var WebIM = WebIM.default

var app = getApp()

class Loginer {

    getUserInfo (that,uid){
        var loginer = this
        loginer.beginLoading(that)
        // 微信登录
        wx.login({
            success: function(res) {
                var rescode = res.code
                if (rescode) {
                    // 获取用户信息
                    wx.getUserInfo({
                        success: function (res) { 
                           app.globalData.userInfo.avatarUrl = res.userInfo.avatarUrl
                           app.globalData.userInfo.nickName = res.userInfo.nickName
                            wx.setStorageSync('userInfo',app.globalData.userInfo) 
                            // 发起网络请求
                            wx.request({
                                url: app.globalData.http_header + 'index.php?m=index&a=getOpenIDAction&appjson=1&appid='+app.globalData.appid+'&secret='+app.globalData.secret+'&grant_type='+app.globalData.grant_type+'&js_code=' + rescode,
                                // data:{},
                                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                                // header: {}, // 设置请求的 header
                                success: function(res){
                                    var data = res.data
                                    if(typeof res.data === 'string') {
                                        data = JSON.parse(res.data.trim());
                                    }
                                    var openid = data.openid
                                    // 第三方登录或者注册
                                    loginer.thirdLogin(openid, loginer, that, uid)
                                },
                            fail: function() {
                                // fail
                                loginer.stopLoading(that)
                            }
                        })            
                    },
                    fail: function(e) {
                        // fail
                        console.log(e.errMsg)
                        loginer.stopLoading(that)
                    }
                })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                    loginer.stopLoading(that)
                }
            },
            fail: function(e) {
                // fail
                loginer.stopLoading(that)
            }
        })
    }

    thirdLogin (openid, loginer, that, uid){
        wx.request({
            url: app.globalData.http_header + 'index.php?m=index&a=third_login&appjson=1',
            data: {
                username :app.globalData.userInfo.nickName ,
                openid : openid ,
                longitude : '1.3' ,
                latitude : '1.3' ,
                id : 'wechat' ,
                logo :app.globalData.userInfo.avatarUrl 
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            }, // 设置请求的 header
            success: function(res){
                var data = res.data
                if(typeof res.data === 'string') {
                    data = JSON.parse(res.data.trim());
                }
                if(data.message == "成功！"){ //注册成功
                    console.log('注册成功')
                    loginer.thirdLogin(openid,loginer,that,uid)
                    // 设置来自id
                    // loginer.setFromId(that,uid)

                } else if(data.message == '登录成功！'){  //登录成功
                    console.log('登录成功！')
                    app.globalData.userInfo.groupid = data.rows.se_groupID || ''
                    wx.setStorageSync('userInfo',app.globalData.userInfo)
                    wx.setStorageSync('com', data.rows.com)
                    loginer.loginHuanxin(openid,that)
                    
                    // 设置来自id
                    loginer.setFromId(that,uid)
                } 
                loginer.stopLoading(that)
            },
            fail: function() {
                // fail
                loginer.stopLoading(that)
            }
        })
    }

    setFromId (that,uid){
        if(uid == null) {
            return
        }
        var com = wx.getStorageSync('com')
        wx.request({
            url: app.globalData.http_header + 'index.php?m=User&a=info&appjson=1&relation=1&com=' + com,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
                // success
                console.log('--------------')
                console.log(res)
                // if(res.data.info.from_id == '' || res.data.info.from_id == null || res.data.info.from_id == '0' ){
                    wx.request({
                        url: app.globalData.http_header + 'index.php?m=User&a=from_id&from_id='+ uid +'&appjson=1&com=' + com,
                        data : {},
                        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                        header: { 
                            'content-type': 'application/x-www-form-urlencoded'
                        }, // 设置请求的 header
                        success: function(res){
                            // success
                            console.log("uid - end")
                        }
                    })
                // }
            }
        })
    }

    loginHuanxin (openid,that) {
        // 登录成功
        var options = {
            apiUrl: WebIM.config.apiURL,
            user: openid,
            pwd: md5.hex_md5(openid),
            appKey: WebIM.config.appkey,
            grant_type: "password"
        }
        
        var userInfo = wx.getStorageSync('userInfo')
        userInfo.openid = openid
        wx.setStorageSync('userInfo', userInfo) 
        WebIM.conn.open(options)    
        if(!wx.getStorageSync('joinbeijing')){
            this.addBeijingGroup()
        }
        if(!wx.getStorageSync('joincanada')){
            this.addCanadaGroup()
        }
    } 
    
    stopLoading  (that){
        
        wx.hideNavigationBarLoading()
        that.setData({hidden : true})
        // wx.setNavigationBarTitle({ title: '首页' })
    }
    beginLoading  (that){
        
        wx.showNavigationBarLoading()
        // wx.setNavigationBarTitle({ title: '登录中...' })
        that.setData({hidden : false})
    }
    addCanadaGroup  (){
        // 请求
        wx.request({
            url: app.globalData.http_header +'index.php?m=User&appjson=1&a=ea_getGroups',
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
            // success
            var data = res.data
            if(typeof res.data === 'string') {
                data = JSON.parse(res.data.trim());
            }
            var arr = data.ret.data
            var group = null
            for(var i = 0 ;i < arr.length;i++){
                if(arr[i]['groupname'] == "canada"){
                    group = arr[i]
                }
            }
            if(!group){ //没有这个组群
                wx.request({
                    url: app.globalData.http_header + 'index.php?m=User&appjson=1&a=ea_createGroup&groupname=canada&desc=canada&owner='+wx.getStorageSync('userInfo').openid,
                    data: {},
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: function(res){
                        // success

                        console.log('没有这个组群++++++++')
                        var data = res.data
                        if(typeof res.data === 'string') {
                            data = JSON.parse(res.data.trim());
                        }
                        console.log(res)
                        wx.setStorageSync('joincanada', "joinedcanada")
                        wx.setStorageSync('canadagroupid',  data.ret.data.groupid)
                    },
                    fail: function(res) {
                        // fail
                        console.log(res)
                    },
                    complete: function() {
                        // complete
                        console.log('joincanada- complete')
                    }
                })
            }else{ //有这个组群
                wx.request({
                    url: app.globalData.http_header + 'index.php?m=User&appjson=1&a=ea_addGroupsUser&group_id='+group.groupid+'&username='+wx.getStorageSync('userInfo').openid,
                    data: {},
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: function(res){
                        // success
                        console.log('有这个组群++++++++')
                        console.log(res)
                        var data = res.data
                        if(typeof res.data === 'string') {
                            data = JSON.parse(res.data.trim());
                        }
                        wx.setStorageSync('joincanada', "joinedcanada")
                        wx.setStorageSync('canadagroupid', group.groupid)
                    },
                    fail: function(res) {
                        // fail
                        console.log(res)
                    },
                    complete: function() {
                        // complete
                        console.log('joincanada- complete')
                    }
                })
            }
            }
        })
        }
        addBeijingGroup  (){
        // 请求
        wx.request({
            url: app.globalData.http_header + 'index.php?m=User&appjson=1&a=ea_getGroups',
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
            // success
            var data = res.data
            if(typeof res.data === 'string') {
                data = JSON.parse(res.data.trim());
            }
            var arr = data.ret.data
            var group = null
            for(var i = 0 ;i < arr.length;i++){
                if(arr[i]['groupname'] == "beijing"){
                group = arr[i]
                }
            }
            if(!group){ //没有这个组群
                wx.request({
                    url: app.globalData.http_header + 'index.php?m=User&appjson=1&a=ea_createGroup&groupname=beijing&desc=beijing&owner='+wx.getStorageSync('userInfo').openid,
                    data: {},
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: function(res){
                        // success
                        console.log("没有这个组群------")
                        console.log(res)
                        var data = res.data
                        if(typeof res.data === 'string') {
                            data = JSON.parse(res.data.trim());
                        }
                        wx.setStorageSync('joinbeijing', "joinedbeijing")
                        wx.setStorageSync('beijinggroupid',  data.ret.data.groupid)
                    },
                    fail: function(res) {
                        // fail
                        console.log(res)
                    },
                    complete: function() {
                        // complete
                        console.log('joinbeijing-complete')
                    }
                })
            } else { //有这个组群
                
                wx.request({
                    url: app.globalData.http_header + 'index.php?m=User&appjson=1&a=ea_addGroupsUser&group_id='+group.groupid+'&username='+wx.getStorageSync('userInfo').openid,
                    data: {},
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: function(res){

                        // success
                        console.log("有这个组群------")
                        console.log(res)
                        var data = res.data
                        if(typeof res.data === 'string') {
                            data = JSON.parse(res.data.trim());
                        }
                        wx.setStorageSync('joinbeijing', "joinedbeijing")
                        wx.setStorageSync('beijinggroupid', group.groupid)
                    },
                    fail: function(res) {
                        // fail
                        console.log(res)
                    },
                    complete: function() {
                        // complete
                         console.log('joinbeijing-complete')
                    }
                })
            }
            }
        })
    }   
}

function createLoginer(){
     return new Loginer();
}

module.exports = {
  createLoginer: createLoginer
}