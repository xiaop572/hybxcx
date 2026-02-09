// subpackages/hdbm/hdbm.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xinmin: "",
    mobile: "",
    corp: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  submit() {
    console.log(this.data.mobile.length)
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名',
      })
      return;
    } else if (this.data.mobile.length !== 11) {
      wx.showToast({
        title: '请填写正确手机号',
      })
      return;
    } else if (!this.data.corp) {
      wx.showToast({
        title: '请填写单位',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/sm/zxxhbm",
      method: "POST",
      data: {
        xinmin: this.data.xinmin,
        mobile: this.data.mobile,
        corp: this.data.corp
      },
      success: res => {
       if(res.data.status){
        wx.showModal({
          title: '提示',
          content: '报名成功',
          showCancel:false
        })
       }else{
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel:false
        })
       }
        // if (res.data.status) {
        //   wx.showModal({
        //     title: '报名成功',
        //     content: '是否购买入场票?',
        //     success: res => {
        //       if (res.confirm) {
        //         wx.navigateTo({
        //           url: '../goupiao/goupiao?xinmin=' + this.data.xinmin + '&mobile=' + this.data.mobile + '&corp=' + this.data.corp,
        //         })
        //       }
        //     }
        //   })
        // } else {
        //   wx.showModal({
        //     title: res.data.msg,
        //     content: '是否购买入场票?',
        //     success: res => {
        //       if (res.confirm) {
        //         wx.navigateTo({
        //           url: '../goupiao/goupiao?xinmin=' + this.data.xinmin + '&mobile=' + this.data.mobile + '&corp=' + this.data.corp,
        //         })
        //       }
        //     }
        //   })
        // }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})