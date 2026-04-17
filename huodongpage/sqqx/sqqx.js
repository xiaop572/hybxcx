// huodongpage/sqqx/sqqx.js
const { req } = require('../../utils/request')
const { baseUrl } = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: ''
  },

  /**
   * 监听姓名输入
   */
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  /**
   * 提交申请
   */
  submitApplication() {
    const name = this.data.name.trim();

    if (!name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return;
    }

    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return;
    }

    wx.showLoading({
      title: '提交中...',
    })

    req({
      url: baseUrl + '/newapi/api/subt/applyaccess',
      method: 'POST',
      data: {
        openid: openid,
        username: name
      },
      success: (res) => {
        wx.hideLoading();
        console.log('提交申请返回:', res.data);
        
        if (res.data && res.data.status) {
          wx.showToast({
            title: '申请已提交',
            icon: 'success',
            duration: 2000
          });
          
        } else {
          wx.showToast({
            title: res.data?.msg || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交申请失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
  
})