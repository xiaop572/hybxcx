// pages/mzMake/mzMake.js
const util = require('../../utils/util')
const { req } = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keshiList: [],
    keshiImgs:{
      ek:'https://wx.pmc-wz.com/materials/erke.png',
      dnk:'https://wx.pmc-wz.com/materials/neike.png',
      zxjgm:'https://wx.pmc-wz.com/materials/zhengxing.png',
      ck:'https://wx.pmc-wz.com/materials/chanke.png',
      gk:'https://wx.pmc-wz.com/materials/guke.png',
      dwk:'https://wx.pmc-wz.com/materials/waike.png',
      tjzx:'https://wx.pmc-wz.com/materials/tijian.png',
      jjk:'https://wx.pmc-wz.com/materials/jijiu.png'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getkstree',
      success: res => {
        this.setData({
          keshiList: res.data
        })
        console.log(this.data.keshiList)
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})