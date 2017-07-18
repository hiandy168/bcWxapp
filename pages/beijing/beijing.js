// pages/beijing/beijing.js
var util =  require('../../utils/util.js')
var elementer =  require('../../utils/element.js')
var messager =  require('../../utils/message.js')
var user =  require('../../utils/user.js')
var tool =  require('../../utils/tools.js')
var strophe = require('../../utils/strophe.js')
var WebIM = require('../../utils/WebIM.js')
var WebIM = WebIM.default
var loginer = require('../../utils/loginer.js')

var app = getApp()
Page({
  data:{
    minute: '00',
    second : '00',
    isHidden:true, // 是否显示站数列表
    selectedIndex:0, //被选中的站数
    minusEnable : 'B',
    plusEnable : 'B',
    latestData : [], // 
    dates10 : [], //最新的十个站号
    messages : [], // 消息列
    scrollTop:  0, // 消息滚动高度
    inputText : "", //输入框内容
    state : "进行中:",
    showTrend : 'showTrend1',
    trendIsHideen : true,
    trendLeftSelected : true,
    highLightColor : 'rgb(51, 83, 151)',
    normalColor : 'rgb(0, 199, 247)',
    uid : null,
    // 分页
    currentPage : 1,
    pageSize : 30,

    interval : null,
    tineout : null,
    fake : null,
    nodata : null,
    
    debug : true,
    tato : 0,
    ttime : 60,
    opentime : 300
  },
  onLoad:function(options){

    console.log("onLoad")

    var that = this

    // 获取二维码的数据
    if(options.uid != null){
    
      that.setData({
        uid : options.uid
      })
    }else {

    }

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
        for(var i = 0; i < data.rows.length; i++){
          if(data.rows[i].game == '北京'){
            that.setData({ 
              tato : data.rows[i].tato,
              ttime : data.rows[i].ttime,
              opentime : data.rows[i].opentime
            })
          }
        }
      },
      fail : function (){
        console.log('fail')
      },
      complete : function (){
        console.log('complete')
      }
    })

  
    // 输入框位置处理
    that.setScrollViewHeight(that)
    
    // 获取已经开奖的10站数据  
    that.getThe10Datas(that);    

    // 模拟发消息
    that.sendFakeMsg(that)


  },
  sendFakeMsg : function (that) {
    
    if(that.data.tato == 0){
      setTimeout(function(){
        that.sendFakeMsg(that)
      },4000)
      return
    }

    // 头像随机
    var index = Math.floor(Math.random() * 100) + 1
    var avatarUrl =  app.globalData.http_header + '/Uploads/User/default_' +index+ '.jpg'
    
    // 类型随机
    var types = ['大单','小单','大双','大单','小','大','双','单','极大','极小','哈小','哈大','哈单','哈双','哈大单','哈大双','哈小单','哈小双']
    var type =  types[Math.floor(Math.random() * types.length)]

    // 时间随机
    var deltaTime = Math.floor(Math.random() * 20000) + 4000

    // 金额随机
    var num =  Math.floor(Math.random()*10 + 1) * 100
    num = type.substring(0,1) == '哈' ? num + Math.floor(Math.random()*100) :  num

    var e = {
                  detail : {
                    value : {
                      value : Math.random() > 0.2 ? (type + num) : ('' + Math.floor(Math.random() * 27 + 1)  + ['草','操','艹','.'][Math.floor(Math.random() * 4)] + [50,100,150,200][Math.floor(Math.random() * 4)]),
                    } 
                  }
              }
    if(!that.data.loading){
      that.insertMsg(that,e,avatarUrl,'mine')  
    }
    
    setTimeout(function(){
        that.sendFakeMsg(that)
      },deltaTime)
  },
  isDebug : function (that,debug){
      // debug = 0
      // success
      if(debug == 1){ // 1测试版本 0正式版本
        that.setData({
          debug : true,
          showTrend : 'showTrend1'
        })
      }else {
          that.setData({
          debug : false,
          showTrend : 'showTrend'
        })
      }
  },
  setScrollViewHeight : function (that){ // 输入框位置处理
    
    var z = 160 + 118 + 126 
    var hei = app.globalData.systemInfo.windowHeight
    if(app.globalData.systemInfo.system.substr(0,3) == 'iOS'){
      hei =  hei - 50
    }
    var x = 750 * hei / app.globalData.systemInfo.windowWidth 
    that.setData({ scrollHeight : x - z }) 
  },
  getTheNewOneNoOpenData : function(that){ // 获取最近一站的未开信息
    wx.request({
        url: app.globalData.http_header + 'index.php?m=Gamematch&a=index&status=0&appjson=1&gameid=1&status=1&rows=1&sort=id&order=asc', 
        //status 0 未开奖 1 开奖
        data: {},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function(res){
          
          var data = res.data
          if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
          }

          // 数据为空
          if(data.rows.length == 0) {
            //游戏关闭
            that.setData({
               thenews : parseInt(that.data.latestData[0].id) + 1
            })

            if(that.data.nodata){
              clearTimeout(that.data.nodata)
            }
            that.data.nodata = setTimeout(function(){
              that.getTheNewOneNoOpenData(that)
            },10000)
            return
          }

          // 获取未开最新一站的时间
          var addtime = data.rows[0].addtime
          that.setData({
            thenews : data.rows[0].issue,
            loading : false
          }) 
          // 定时器
          that.data.interval = setInterval(function (){ 
              
            let now = new Date()
            var delta = addtime - Math.floor(now.getTime()/1000)
            
            that.setData({
              minute : Math.floor(delta/60),
              second : delta%60
            })
            if(delta < that.data.ttime || delta > that.data.opentime){ //判断是否是下注时间区
              that.setData({ loading : true })
            }else{
              that.setData({ loading : false })
            }
            if(delta <= 0){ //判断是否有5分钟
              that.setData({
                minute : '00',
                second : '00'
              })
              // 清除定时器
              clearInterval(that.data.interval)
              
              // 获取最近的已开一站信息
              that.getTheNewOneOpenedData(that)

            }
          },1000)
        }
      })
  },
  insertMsg : function(that,e,avt,type1){
    that.manalFormSubmit(that,e,avt,type1)
  },
  getTheNewOneOpenedData :function (that){ // 获取最新的已开启的一站

     wx.request({
      url: app.globalData.http_header + 'index.php?m=Gamematch&a=index&appjson=1&gameid=1&status=3&rows=1', 
      // gameid:北京 status: 0开奖 1未开奖 rows 页面大小 page 页数
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
         var data = res.data
          if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
          }
        // 数据为空
        if(data.rows.length == 0) {
          
          if(that.data.timeout){
            clearTimeout(that.data.timeout)
          }
          that.data.timeout = setTimeout(function(){
            that.getTheNewOneOpenedData(that)
          },5000)
          
          return
        }else { // 已开启
          if(that.data.timeout){
            clearTimeout(that.data.timeout)
          }
        }

        // 判断是否已经开启最新一站
        if( that.data.latestData.length != 0){ // 本地数据不为空

            if (that.data.latestData[0].id == data.rows[0].issue ){ // 未开启成功， 每间隔10秒钟请求一次
              if(that.data.timeout){
                clearTimeout(that.data.timeout)
              }
              that.data.timeout = setTimeout(function(){
                that.getTheNewOneOpenedData(that)
              },5000)
              return
            }else { // 已开启
              if(that.data.timeout){
                clearTimeout(that.data.timeout)
              }
              that.setData({ loading : false })  
            }
        }else {
          that.setData({ loading : false })  
        }

        var item = data.rows[0]
        var temp = elementer.createElement({
          "id" :parseInt(item.issue),
          "firstNum":item.result_6,
          "secondNum":item.result_12,
          "thirdNum":item.result_18,
          "sum":item.result_number,
          "sumlevel": item.result_number > 13 ? "大" : "小",
          "sumType": item.result_number%2 == 0 ? "双" : "单",
          "beginTime": util.shortFormatTime(new Date(item.addtime * 1000)),
        })
        that.data.latestData.unshift(temp)
        var length = that.data.latestData.length > 10 ? 10 :that.data.latestData.length
        that.setData({
          latestData : that.data.latestData,
          currentPage : that.data.currentPage + 1,
          dates10 : that.data.latestData.slice(0,length)
        })
        that.checkBtnEnable(that)     

        // 插入本地消息 因为不在经过服务器处理这个结果 所以直接在本地处理
        // 获取结果后 将结果进行计算 反馈给用户
        var e = {
                    detail : {
                      value : {
                        value : '第'+item.issue+'站，' + (item.result_number > 13 ? "大" : "小") + (item.result_number%2 == 0 ? "双" : "单") + item.result_number,
                        type : 'admin'
                      } 
                    }
                }
        that.insertMsg(that,e,'','mine')  

        // 获取最新一站的中奖结果
        that.getWinInfo(that,item.issue)

        // 获取最新一站未开启的数据
        that.getTheNewOneNoOpenData(that)


      }
    })
  },
  getWinInfo : function (that,issue) { // 获取最新一站的情况
    var com = wx.getStorageSync('com')
    wx.request({
      url: app.globalData.http_header + '/index.php?m=Gamebet&a=index&appjson=1&gameid=1&issue='+ issue +'&com=' + com, 
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        // 获取结果后 将结果进行计算 反馈给用户
        console.log('getWinInfo')
        console.log(res.data)
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        if(data.rows.length == 0){
          return
        }else {
          var arr = '第' + data.rows[0].issue + '站，'+ '结果'+data.rows[0].bat + '。'
          for(var i = 0; i < data.rows.length; i++){
            var item = data.rows[i]
            if(item.status1 == '取消') continue
            arr = arr + item.bet_type +"->"+ item.bet_money + '，赔率'+ item.odds + ',' +  item.status1 + Math.abs(item.bunko - item.bet_money) + '；'
          }
          var e = {
                    detail : {
                      value : {
                        value : arr,
                        type : 'admin'
                      } 
                    }
                }
          that.insertMsg(that,e,'','mine')
        }
          
      }
    })
  },
  getThe10Datas : function(that){ // 获取最近的30站数据 
    that.setData({loading: true})
    wx.request({
      url: app.globalData.http_header + 'index.php?m=Gamematch&a=index&appjson=1&gameid=1&status=3&rows='+that.data.pageSize+'&page='+that.data.currentPage, // gameid:北京 加拿大 status: 1开奖 0未开奖 rows 页面大小 page 页数
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        console.log(res)
        var data = res.data
          if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
          }
        if(res.data.version == '1.3'){ 
          that.isDebug(that,1)
        }else{
          that.isDebug(that,0) 
        }
        // 数据为空
        if(data.rows.length == 0){
          // 获取最新一站的未开奖信息
          that.getTheNewOneNoOpenData(that)
          return
        } 

        var arr = []
        for(var i=0; i<data.rows.length;i++ ){
          var item = data.rows[i]
          var temp = elementer.createElement({
            "id" :parseInt(item.issue),
            "firstNum":item.result_6,
            "secondNum":item.result_12,
            "thirdNum":item.result_18,
            "sum":item.result_number,
            "sumlevel": item.result_number > 13 ? "大" : "小",
            "sumType": item.result_number%2 == 0 ? "双" : "单",
            "beginTime": util.shortFormatTime(new Date(item.addtime * 1000)),
            "duration":300
          })
          arr.push(temp)
        }
        var length = data.rows.length > 10 ? 10 :data.rows.length.length
        that.setData({
          latestData : arr,
          currentPage : that.data.currentPage + 1,
          dates10 : arr.slice(0,length)
        })
        that.checkBtnEnable(that)

        // 获取最新一站的未开奖信息
        that.getTheNewOneNoOpenData(that)
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '加载失败',
          icon: 'fail',
          duration: 1000
        })
      }
    })
  },
  checkBtnEnable :function(that){
    // 按钮是否可以点击 
    if(that.data.selectedIndex == that.data.dates10.length-1){
      that.setData({plusEnable : 'B'})
    }else{
      that.setData({plusEnable : 'A'})
    }
    if(that.data.selectedIndex == 0){
      that.setData({minusEnable : 'B'})
    }else{
      that.setData({minusEnable : 'A'})
    }
  },
  onReady:function(){
    console.log("onReady")
    // 页面渲染完成
    var that = this
    var login = loginer.createLoginer()
    login.getUserInfo(that,that.data.uid)
  },
  onShow:function(){
    console.log("onShow")
    // 页面显示
    var that = this
    var openid = wx.getStorageSync('userInfo').openid
    if(openid){
      var login = loginer.createLoginer()
      login.loginHuanxin(openid,that)
    }
  },
  onHide:function(){
  },
  onUnload:function(){
  
    // 页面关闭
    var that = this
    // 清除计数器
    if(that.data.interval){
      clearInterval( that.data.interval)  
    }
    // 清除时间栈
    if(that.data.timeout){
      clearTimeout(that.data.timeout)
    }

    // 清除时间栈
    if(that.data.fake){
      clearInterval(that.data.fake)
    }

    if(that.data.nodata){
      clearTimeout(that.data.nodata)
    }
  },
  minusA : function (e){ // 减号点击
    var that = this
    that.data.selectedIndex -= 1
    if(that.data.selectedIndex == 0){
      that.setData({minusEnable : 'B'})
    }
    that.setData({
       selectedIndex : that.data.selectedIndex,
       plusEnable : 'A'
    })
  },
  plusA : function (e){ // 加号点击
    var that = this
    
    that.data.selectedIndex += 1
    if(that.data.selectedIndex == that.data.dates10.length-1){
      that.setData({plusEnable : 'B'})
    }
    that.setData({
      selectedIndex : that.data.selectedIndex,
      minusEnable : 'A' 
    })
  },
  inputBtnClicked : function(e){ // 站数列表被点击
     this.setData({isHidden:!this.data.isHidden})     
  },
  oneBtnCatched : function(e){ // 任意一站被点击
    this.setData({
      isHidden : !this.data.isHidden,
      selectedIndex : e.currentTarget.dataset.index
    })
    var that = this
    if(that.data.selectedIndex == that.data.dates10.length-1){
      that.setData({plusEnable : 'B'})
    }else{
      that.setData({plusEnable : 'A'})
    }
    if(that.data.selectedIndex == 0){
      that.setData({minusEnable : 'B'})
    }else{
      that.setData({minusEnable : 'A'})
    }
  },
  formSubmit : function(e){ // 发送消息
    var that = this
    if(that.data.loading){
      // 当前禁止下注
      var e = {
                    detail : {
                      value : {
                        value : '聊天：' + e.detail.value.value,
                        type : 'admin'
                      } 
                    }
                }
  
      // 计算文本高度    
      var textHeight = tool.getTextWidth(e.detail.value.value, (750 - 60)*0.8*0.8 - 36, 28, 32)
      var user =  wx.getStorageSync('userInfo')
      var message = messager.createMessage({
        type1 : "right",
        content : e.detail.value.value,
        CTime : util.shortFormatTime(new Date()),
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
          to: wx.getStorageSync('beijinggroupid'),
          roomType: false,
          chatType: 'chatRoom',
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
      msg.setGroup('groupchat');
      WebIM.conn.send(msg.body);
  
     return
    }

    // 当前未禁止下注
    if(e.detail.value.value.length > 0) {  // 有文字
      // 计算文本高度    
      var textHeight = tool.getTextWidth(e.detail.value.value, (750 - 60)*0.8*0.8 - 36, 28, 32)
      var user =  wx.getStorageSync('userInfo')
      var message = messager.createMessage({
        type1 : "right",
        content : e.detail.value.value,
        CTime : util.shortFormatTime(new Date()),
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
      // var id = WebIM.conn.getUniqueId();
      // var msg = new WebIM.message('txt', id);
      // msg.set({
      //     msg:  e.detail.value.value,
      //     to: wx.getStorageSync('beijinggroupid'),
      //     roomType: false,
      //     chatType: 'chatRoom',
      //     ext : {
      //       user : user
      //     },
      //     success: function (id, serverMsgId) {
      //         console.log('send room text success');
      //     },
      //     fail: function () {
      //         console.log('failed');
      //     }
      // });
      // msg.setGroup('groupchat');
      // WebIM.conn.send(msg.body);

      // 发送下注信息
      var betInfo = {
        issue : that.data.thenews ,
	      gameid : 1,
	      bet_content : e.detail.value.value
      }
      that.sendBetInfo(that, betInfo)
    }
  },
  sendBetInfo: function (that, betInfo){// 发送下注信息
    
    var com = wx.getStorageSync('com')

    wx.request({
    
      url: app.globalData.http_header + 'index.php?m=Gamebet&a=add&appjson=1&com=' + com,
      data: betInfo,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) { // success
          
         var data = res.data
          if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
          }
        var resInfo = null
        if (res.data.state){
          let qi = (that.data.latestData[0].id + 1)
          resInfo = { value :'当前'+ qi  +'站，' + data.message + '。' }
          
          // 下注成功 发送信息
          var id = WebIM.conn.getUniqueId();
          var msg = new WebIM.message('txt', id);
          msg.set({
              msg:  res.data.data.bet_content,
              to: wx.getStorageSync('beijinggroupid'),
              roomType: false,
              chatType: 'chatRoom',
              ext : {
                user: wx.getStorageSync('userInfo')
              },
              success: function (id, serverMsgId) {
                  console.log('send room text success');
              },
              fail: function () {
                  console.log('failed');
              }
          });
          msg.setGroup('groupchat');
          WebIM.conn.send(msg.body);
          
          console.log('groupchat')

        }else {

          resInfo = {
            value : data.message,
            type : 'admin'
          }
        }
        
        var e = {
                    detail : {
                      value : resInfo
                    }
                }
        that.manalFormSubmit(that,e,'','')
      },
      fail: function() {
        // fail
        var e = {
                    detail : {
                      value : {
                        value : '下注失败！',
                        type : 'admin'
                      } 
                    }
                }
        that.manalFormSubmit(that,e,'','')
      }
    })
  },
  manalFormSubmit : function(that,e, avt,type1){ // 发送消息
    if(e.detail.value.value.length > 0){  // 有文字
      // 计算文本高度    
      var textHeight = tool.getTextWidth(e.detail.value.value, (750 - 60)*0.8*0.8 - 36, 28, 32)
      var user =  wx.getStorageSync('userInfo')
      user.avatarUrl = avt.length > 0 ? avt : '../../images/default.png'
      
      if(e.detail.value.type != undefined){
        var message = messager.createMessage({
          type1 : "left",
          content : e.detail.value.value,
          CTime : util.shortFormatTime(new Date()),
          user : user,
          textHeight : textHeight + 36 + 60,
          color : 'red'
        })
      }else {
        var message = messager.createMessage({
          type1 : "left",
          content : e.detail.value.value,
          CTime : util.shortFormatTime(new Date()),
          user : user,
          textHeight : textHeight + 36 + 60,
        })
      }
      
      that.data.messages.push(message)
      if(type1 == 'mine'){
        that.setData({ messages : that.data.messages })
      }else {
        that.setData({ messages : that.data.messages,inputText :'' })
      }
      

      var txtHeight = 0
      for(var i = 0;i<that.data.messages.length;i++){
        txtHeight += that.data.messages[i].textHeight 
      }
      var deltaH  = txtHeight - that.data.scrollHeight
      if(deltaH > 0){
        that.setData({scrollTop : deltaH })
      }
    }
  },
  finish:function (e){
    var that = this
    e.detail.value = {value : e.detail.value}
    that.formSubmit(e) 
  },
  showTrend : function (e){
    var that = this
    that.setData({trendIsHideen : !that.data.trendIsHideen})
  },
  trendLeftClicked : function (e){
    var that = this
    if(that.data.trendLeftSelected) return
    that.setData({
      trendLeftSelected : !that.data.trendLeftSelected
    })
  },
  trendRightClicked : function (e){
    var that = this
    if(!that.data.trendLeftSelected) return
    that.setData({
      trendLeftSelected : !that.data.trendLeftSelected
    })
  },
  onShareAppMessage: function () {
    
    return {
      title: '北京28',
      path: 'pages/beijing/beijing'
    }
  },
  receiveMsg: function (msg, type) {
      var that = this
      if(msg.data.length > 0){  // 有文字
        // 计算文本高度    
        var textHeight = tool.getTextWidth(msg.data, (750 - 60)*0.8*0.8 - 36, 28, 32)
        var message = messager.createMessage({
          type1 : msg.from == wx.getStorageSync('userInfo').openid ? 'right' : "left",
          content : msg.data,
          CTime : util.shortFormatTime(new Date()),
          user : msg.ext.user,
          textHeight : textHeight + 36 + 60,
        })
        that.data.messages.push(message)
        that.setData({
          messages : that.data.messages
        })

        var txtHeight = 0
        for(var i = 0;i<that.data.messages.length;i++){
          txtHeight += that.data.messages[i].textHeight 
        }
        var deltaH  = txtHeight - that.data.scrollHeight
        if(deltaH > 0){
          that.setData({scrollTop : deltaH })
        }

        var users = wx.getStorageSync('users');
        if(!users){
          users = []
        }else {
          if(users.length > 20){
            users.shift()
          }
        }
        for(var i = 0; i < users.length; i++){
          if(users[i].openid == msg.ext.user.openid) return
        }
        users.push(msg.ext.user)      
        wx.setStorageSync('users', users)
      }

  },
  bindscrolltolower : function(e){
    var that = this
    wx.request({
      url: app.globalData.http_header + 'index.php?m=Gamematch&a=index&appjson=1&gameid=1&status=3&rows='+that.data.pageSize+'&page=' + that.data.currentPage,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        var data = res.data
          if(typeof res.data === 'string') {
            data = JSON.parse(res.data.trim());
          }
        // success
        if(data.rows.length <= 0){
          wx.showToast({
            title: '没得更多了！',
            icon: 'success',
            duration: 1000
          })
          return
        }
        for(var i=0; i<data.rows.length;i++ ){
          var item = data.rows[i]
          var temp = elementer.createElement({
            "id" :parseInt(item.issue),
            "firstNum":item.result_6,
            "secondNum":item.result_12,
            "thirdNum":item.result_18,
            "sum":item.result_number,
            "sumlevel": item.result_number > 13 ? "大" : "小",
            "sumType": item.result_number%2 == 0 ? "双" : "单",
            "beginTime": util.shortFormatTime(new Date(item.addtime * 1000)),
            "duration":300
          })
          that.data.latestData.push(temp)
        }
        that.setData({
          latestData : that.data.latestData,
          currentPage : that.data.currentPage + 1
        })
        
        that.checkBtnEnable(that)
      }
    })
  },
  clickedCell : function(e){
    var that = this
    if(e.currentTarget.dataset.cell.user.openid && e.currentTarget.dataset.cell.user.openid != wx.getStorageSync('userInfo').openid &&  e.currentTarget.dataset.cell.user.openid != wx.getStorageSync('CFG_OPENID') ){
      that.into_chatRoom(e.currentTarget.dataset.cell.user)
    }
  },
  into_chatRoom: function (e) {
    console.log(e)
    var that = this
    var cell = e.currentTarget.dataset.cell
    if(cell.type1 == "left" && cell.user.openid != wx.getStorageSync('userInfo').openid && wx.getStorageSync('userInfo').openid == wx.getStorageSync('CFG_OPENID') ){
      var my = wx.getStorageSync('userInfo').openid
      var nameList = {
          myName: my,
          your: cell.user.openid,
          avatarUrl : cell.user.avatarUrl,
          nickName : cell.user.nickName
      }
      wx.navigateTo({
          url: '../mine/pages/chatroom/chatroom?username=' + JSON.stringify(nameList) + '&nickname=' + cell.user.nickName
      })
    }     
  }
})