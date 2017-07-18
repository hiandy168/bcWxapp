// pages/rules/rules.js
var app = getApp()

Page({
  data:{
    rules : []
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    // 加载游戏规则
    that.getRules(that)
    
  },
  getRules : function (that){
    wx.request({
      url: app.globalData.http_header + 'index.php?m=Game&a=index&appjson=1',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        var data = res.data
        if(typeof res.data === 'string') {
          data = JSON.parse(res.data.trim());
        }
        if(data.rows.length <= 0){
          wx.showToast({
            title: '游戏为空！',
            icon: 'success',
            duration: 1000
          })
          setTimeout(function(){
            wx.navigateBack({delta: 1})
          },1000)
          return 
        }
        that.setData({
          rules : data.rows
        })         
      },
      complete : function (){
        that.setData({ hidden : true})
      }
    })
  },
  itemClicked : function (e){
    var that = this
    
    for(var i = 0; i < that.data.rules.length ; i++){

      if(e.target.dataset.name == that.data.rules[i].game){
        var content  = {
          title : e.target.dataset.name,
          content : that.data.rules[i].content
        }
        wx.navigateTo({
          url: 'ruleDetail/ruleDetail?content=' + JSON.stringify(content)
        })
      }
    }
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
  }
})