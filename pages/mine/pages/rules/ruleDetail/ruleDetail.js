// pages/mine/pages/rules/ruleDetail/ruleDetail.js
var WxParse = require('../../../../../wxParse/wxParse.js')
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    var content = JSON.parse(options.content)
    wx.setNavigationBarTitle({
      title: content.title 
    })
    /** 
    * WxParse.wxParse(bindName , type, data, target,imagePadding) 
    * 1.bindName绑定的数据名(必填) 
    * 2.type可以为html或者md(必填) 
    * 3.data为传入的具体数据(必填) 
    * 4.target为Page对象,一般为this(必填) 
    * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选) 
    */  
    var that = this;  
    WxParse.wxParse('article', 'html', content.content, that,5);  

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