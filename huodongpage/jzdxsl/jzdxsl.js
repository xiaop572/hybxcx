const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
// subpageB/51hjz/51hjz.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:"",
    phone:"",
    visitCount:""
  },
  
  /**
   * 表单提交处理
   */
  submitForm(e) {
    const formData = this.data;
    
    // 表单验证
    if (!formData.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!/^1\d{10}$/.test(formData.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.visitCount) {
      wx.showToast({
        title: '请输入到院人数',
        icon: 'none'
      });
      return;
    }
    
    // 准备提交的数据
    const submitData = {
      xinmin: formData.name,
      mobile: formData.phone,
      renshu: formData.visitCount,
      typeid: 1,
      typename: '减重代谢与形体管理沙龙'
    };

    // 发送表单数据到服务器
    req({
      url: util.baseUrl+'/newapi/api/xys/tjxys',
      method: 'POST',
      data: submitData,
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          });
          this.setData({
            name:"",
            phone:"",
            visitCount:""
          })
        } else {
          wx.showToast({
            title: res.data.msg || '提交失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: () => {
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
  onShareAppMessage: function () {
    return {
      title: '【科学减重・健康同行】公益沙龙会，5 月 25 日 13:30，诚邀您解锁健康减重新方式！',
      path: '/huodongpage/jzdxsl/jzdxsl?fromid=' + wx.getStorageSync('openid'),
      imageUrl: "https://wx.pmc-wz.com/materials/hmb/jzslfxt.jpg"
    };
  }
  /**
   * 用户点击右上角分享
   */
})