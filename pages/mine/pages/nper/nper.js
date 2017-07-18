// pages/mine/pages/nper/nper.js
var util =  require('../../../../utils/util.js')
var tool =  require('../../../../utils/tools.js')
var app = getApp()
Page({
  data:{
    sources : [],
    scrollHeight : 0,
    pageSize : 30,
    currentPage : 1,
    hidden : false

  },
  onLoad:function(options){
    var that = this
    // 页面初始化 options为页面跳转所带来的参数

    // 请求数据
    that.getInfo(that)

  },
  getInfo : function (that){
    var com = wx.getStorageSync('com')
    wx.request({
      url: app.globalData.http_header + 'index.php?m=Gamebet&a=index&appjson=1&rows='+ that.data.pageSize+'&page='+that.data.currentPage + '&com=' + com,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        var rows = data.rows
        if(rows.length <= 0) return
        console.log(res)
        for(var i = 0;i < rows.length; i++){
          var item = rows[i]
          
          // bat 结果 
          // bet_content 下注
          // odds 赔率
          // status 状态
          // bunko 盈利
          
          var obj = {
            addtime :  item.addtime.substring(11),
            deltaNum : item.issue,
            endNum : item.bet_type + item.bet_money +',比值'+ item.odds + ',结果'+ item.bat + ',',
            status : item.status1,
            bunko : item.status1 == '取消' ? '。' : Math.abs(item.bunko - item.bet_money) + '。',
            color : item.status1 == "赢" ? 'red' : 'green'
          }
          // obj.height = tool.getTextWidth(obj.endNum + obj.status + obj.bunko, 490, 20, 40)
          that.data.sources.push(obj)
        }
        that.data.currentPage++
        that.setData({
          sources : that.data.sources,
          currentPage : that.data.currentPage,
        })
        // 设置滚动的区域
        that.setScrollarea(that)
      },
      complete : function (){
        that.setData({ hidden : true})
      }
    })
  },
  setScrollarea :function (that){
      var z = 60 
      if(app.globalData.systemInfo.system.substr(0,3) == 'iOS'){
        z = 60 + 49
      }
      var H = ((that.data.sources.length+1) * 20) > (app.globalData.systemInfo.windowHeight - z) ? (app.globalData.systemInfo.windowHeight - z) : ((that.data.sources.length+1) * 20)
      that.setData({ scrollHeight : H }) 
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
  lower : function (e){
    var that = this
    var com = wx.getStorageSync('com')
    wx.request({
      url: app.globalData.http_header + 'index.php?m=Gamebet&a=index&appjson=1&rows='+ that.data.pageSize+'&page='+that.data.currentPage + '&com=' + com,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        var rows = data.rows
        if(rows.length <= 0) {
          wx.showToast({
            title: '没有更多了！',
            icon: 'success',
            duration: 1000
          })
          return
        }
        
        for(var i = 0;i < rows.length; i++){
          var item = rows[i]
          
          var obj = {
            addtime :  item.addtime.substring(11),
            deltaNum : item.issue,
            endNum : item.bet_type + item.bet_money +',比值'+ item.odds + ',结果'+ item.bat + ',',
            status : item.status1,
            bunko : item.status1 == '取消' ? '。' : Math.abs(item.bunko - item.bet_money) + '。',
            color : item.status1 == "赢" ? 'red' : 'green'
          }
          // obj.height = tool.getTextWidth(obj.endNum + obj.status + obj.bunko, 490, 20, 40)
          that.data.sources.push(obj)
        }
        that.data.currentPage++
        that.setData({
          sources : that.data.sources,
          currentPage : that.data.currentPage,
        })
        
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  }
})