// pages/mine/pages/rules/oddsDetail/oddsDetail.js
var app = getApp()
Page({
  data:{
    rows : []
  },
  onLoad:function(options){
    var that = this
    // 页面初始化 options为页面跳转所带来的参数
    var content = JSON.parse(options.content)
    wx.setNavigationBarTitle({
      title: content.title
    })
    that.getInfo(that,content.id)
  },
  getInfo : function (that,id){
    wx.request({
      url: app.globalData.http_header + 'index.php?m=gameodds&a=index&appjson=1&page=1&sort=id&order=asc&gameid=' + id,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        var len = data.rows.length
        if(len%2 != 0){ //奇数
          data.rows.push({
            type : '',
            odds : ''
          })  
        }
        len = data.rows.length/2
      
        that.setData({
          rows1 : data.rows.slice(0,len),
          rows2 : data.rows.slice(len)
        })
      },
      complete : function (){
        that.setData({ hidden : true})
      }
    })
  }
})