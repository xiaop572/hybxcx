const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');

// huodongpage/jskq/jskq.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuthorized: true, // 默认显示内容
    cardImage: '',
    type: '',
    showModal: false,
    usage: '',
    phoneNumber: '',
    shareCode:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    const type = options.type;
    let cardImage = '';
    
    if (type == 1) {
      // 院长
      cardImage = 'https://wx.pmc-wz.com/materials/jskqyz.png';
    } else if (type == 2) {
      // 中高层
      cardImage = 'https://wx.pmc-wz.com/materials/jskqgc.png';
    }

    this.setData({
      cardImage,
      type,
      shareCode:options.shareCode || ''
    });
  },

  handleClaim() {
    if (!this.data.shareCode) {
      wx.showToast({
        title: '无效的分享码',
        icon: 'none'
      });
      return;
    }

    req({
      url: util.baseUrl + '/newapi/api/subt/claim',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        shareCode: this.data.shareCode,
        name: "",
        phone: ""
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.status) {
          wx.showToast({
            title: '领取成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('领取失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },
  rmykq(){
    wx.navigateTo({
      url: '/subpackages/mycard/mycard',
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
    return {
      title: '接收卡券',
      path: `/huodongpage/jskq/jskq?type=${this.data.type}&shareCode=${this.data.shareCode}`
    }
  },

  // 页面交互逻辑（防报错占位）
  showShareModal() {
    this.setData({ showModal: true });
  },

  hideShareModal() {
    this.setData({ showModal: false });
  },

  preventBubble() {},

  onUsageInput(e) {
    this.setData({ usage: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phoneNumber: e.detail.value });
  },

  handleShareSuccess() {
    // 实际分享逻辑由 open-type="share" 触发
    this.hideShareModal();
  },

  handleShareError() {
    wx.showToast({
      title: '请填写完整信息',
      icon: 'none'
    });
  }
})
