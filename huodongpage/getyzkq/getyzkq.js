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
    isAuthorized: true,
    cardImage: '',
    type: '',
    showModal: false,
    usage: '',
    phoneNumber: '',
    shareCode: '',
    showClaimModal: false,
    claimName: '',
    claimPhone: ''
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
    this.setData({
      showClaimModal: true,
      claimName: '',
      claimPhone: ''
    });
  },

  hideClaimModal() {
    this.setData({ showClaimModal: false });
  },

  onNameInput(e) {
    this.setData({ claimName: e.detail.value });
  },

  onClaimPhoneInput(e) {
    this.setData({ claimPhone: e.detail.value });
  },

  getPhoneNumber(e) {
    if (e.detail.iv && e.detail.encryptedData) {
      req({
        url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile2',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: res => {
          if (res.data.status && res.data.data) {
            this.setData({ claimPhone: res.data.data });
            wx.showToast({ title: '获取成功', icon: 'success' });
          } else {
            wx.showToast({ title: '获取手机号失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '获取手机号失败', icon: 'none' });
        }
      });
    } else {
      wx.showToast({ title: '授权失败，请重试', icon: 'none' });
    }
  },

  confirmClaim() {
    const { claimName, claimPhone, shareCode } = this.data;
    if (!claimName) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!claimPhone || claimPhone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    this.setData({ showClaimModal: false });
    wx.showLoading({ title: '领取中...' });
    req({
      url: util.baseUrl + '/newapi/api/huodong/giveyuezidjq',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        xinmin: claimName,
        mobile: claimPhone,
        money:0,
        proid:0
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.status) {
          wx.showToast({ title: '领取成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data.msg || '领取失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('领取失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
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
