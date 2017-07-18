var loginer = require('../../../../utils/loginer.js')

Page({
    data: {
        yourname: '',
        arr: [],
        member : [],
        user : {}
    },
    onLoad : function (chatMsg,id){
        var that = this 

        if(chatMsg){ // 直接被调用

            var member = wx.getStorageSync('member')
            var myName = wx.getStorageSync('userInfo').openid
            var array = []
            for (var i = 0; i < member.length; i++) {
                let path = member[i].openid + myName
                let group = null
                if(path == id){
                    group = chatMsg
                }else {
                    group = wx.getStorageSync(path) 
                }
                array.push(group)
            }
            that.setData({ 
                arr: array,
                member : member
            })
            console.log(array)

        }else { // 系统调用

            var member = wx.getStorageSync('member')
            var myName = wx.getStorageSync('userInfo').openid
            var array = []
            for (var i = 0; i < member.length; i++) {
                let path = member[i].openid + myName
                let group = wx.getStorageSync(path)
                array.push(group)
            }
            that.setData({
                arr: member,
                member : member
             })
            console.log(array)
        }
        
        
    },
    onShow: function () {

        var that = this
        var openid = wx.getStorageSync('userInfo').openid
        var login = loginer.createLoginer()
        login.loginHuanxin(openid,that)
    },
    into_chatRoom: function (event) {
        console.log(event)
        var that = this
        var my = wx.getStorageSync('userInfo').openid
        var nameList = {
            myName: my,
            your: event.currentTarget.dataset.username,
            avatarUrl : event.currentTarget.dataset.avatarurl,
            nickName : event.currentTarget.dataset.nickname
        }
        console.log(my)
        console.log(event.currentTarget.dataset.username)
        wx.navigateTo({
            url: '../chatroom/chatroom?username=' + JSON.stringify(nameList) + '&nickname='+event.currentTarget.dataset.nickname
        })
    },
    del_chat: function (event) {
        var that = this
        console.log(event.currentTarget.dataset.username.toLowerCase() +wx.getStorageSync('userInfo').openid)
        wx.showModal({
            title: '删除该聊天记录',
            confirmText: '删除',
            success: function (res) {
                if (res.confirm) {// success
                    wx.removeStorageSync(event.currentTarget.dataset.username.toLowerCase()+wx.getStorageSync('userInfo').openid)
                    var member = wx.getStorageSync('member')
                    for(var i = 0;i<member.length;i++){
                        if(member[i].openid == event.currentTarget.dataset.username.toLowerCase()){
                            member.splice(i, 1)
                            wx.setStorageSync('member', member)
                            that.onLoad()
                            break
                        } 
                    }
                }
            }
        })
    }

})



