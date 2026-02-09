const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
// huodongpage/tjsrhd/tjsrhd.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFormModal: false, // 控制弹出框显示
    shadevis: false, // 控制遮罩层显示
    formData: {
      name: '', // 姓名
      mobile: '' // 手机号
    }
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
  onShareAppMessage() {

  },

  // 显示表单弹框
  showForm() {
    this.setData({
      showFormModal: true
    });
  },

  // 隐藏表单弹框
  hideForm() {
    this.setData({
      showFormModal: false
    });
  },

  // 阻止事件冒泡
  close() {
    // 空函数，阻止点击表单内容时关闭弹框
  },

  // 姓名输入处理
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  // 手机号输入处理
  onMobileInput(e) {
    this.setData({
      'formData.mobile': e.detail.value
    });
  },

  // 提交表单
  submitForm() {
    const { name, mobile } = this.data.formData;
    
    // 表单验证
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!mobile.trim()) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    
    // 手机号格式验证
    const mobileReg = /^1[3-9]\d{9}$/;
    if (!mobileReg.test(mobile)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 调用API接口
    req({
      url: util.baseUrl + "/newapi/api/brda/getwltjbrdabirth",
      method: "POST",
      data: {
        brxm: name,
        yddh: mobile,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          // 显示成功提示
          wx.showToast({
            title: '领取成功',
            icon: 'success'
          });
          
          // 隐藏表单弹框
          this.hideForm();
          
          // 显示奖品弹框
          this.setData({
            shadevis: true
          });
        } else {
          wx.showToast({
            title: res.data.data || '领取失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 关闭奖品弹框
  closeShade() {
    this.setData({
      shadevis: false
    });
  },

  // 点击奖品卡片
  rcard() {
    wx.navigateTo({
      url: '/subpackages/mycard/mycard',
    })
  }
})