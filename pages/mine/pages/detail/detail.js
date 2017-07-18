// pages/mine/pages/detail/detail.js
var util =  require('../../../../utils/util.js')
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
      url: app.globalData.http_header + 'index.php?appjson=1&m=Usercredits&a=index&rows='+ that.data.pageSize+'&page='+that.data.currentPage + '&com=' + com,
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
          
          var obj = {
            addtime :  util.formatTime(new Date(item.createtime*1000),'long'),
            price_old : (parseFloat(item.price_old)).toFixed(2),
            price_change : parseFloat(item.price).toFixed(2)
          }
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
  lower : function (e){
    
    var that = this
    var com = wx.getStorageSync('com')
    
    console.log(that.data.pageSize)
    console.log(that.data.currentPage)
    console.log(com)

    wx.request({
      url: app.globalData.http_header + 'index.php?appjson=1&m=Usercredits&a=index&rows='+ that.data.pageSize+'&page='+that.data.currentPage+ '&com=' + com,
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
            addtime :  util.formatTime(new Date(item.createtime*1000),'long'),
            price_old : (parseFloat(item.price_old)).toFixed(2),
             price_change : parseFloat(item.price).toFixed(2)
          }
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