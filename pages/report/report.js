// pages/report/report.js
const { req } = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reportList: [],
    islogin:true,
    isshiming:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  rlogin(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  rshiming(){
    wx.navigateTo({
      url: '/pages/realInfo/readlInfo',
    })
  },
  rContent(e) {
    wx.navigateTo({
      url: '../reportContent/reportContent?idx=' + e.currentTarget.dataset.idx,
    })
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
    let userInfo=wx.getStorageSync("userInfo");
    if(!userInfo){
      this.setData({
        islogin:false
      })
    }else{
      this.setData({
        islogin:true
      })
    }
    let realInfo = wx.getStorageSync('realInfo');
    if (!realInfo.cardno || !realInfo.realname || !realInfo.cardno) {
      this.setData({
        isshiming:false
      })
      return
    }else{
      this.setData({
        isshiming:true
      })
    }
    req({
      url: util.baseUrl + '/newapi/api/tijian',
      method: 'POST',
      data: {
        xinmin: wx.getStorageSync('realInfo').realname,
        mobile: wx.getStorageSync('realInfo').mobile,
        cardno: wx.getStorageSync('realInfo').cardno,
      },
      success: (res) => {
        if (res.data.data.length <= 0) { //没有体检信息处理
          wx.showToast({
            title: '您没有体检信息',
          })
          wx.removeStorageSync('tijian')
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
          return;
        }
        res.data.data.forEach(item => {
          let date = new Date(item.physicaldate);
          item.myDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        })
        wx.setStorageSync('tijian', res.data.data)
        this.setData({
          reportList: res.data.data
        })
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