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
    visitCount:"",
    showModalFlag: false,
    today: new Date().toISOString().split('T')[0],
    formData: {
      name: '',
      phone: '',
      date: ''
    }
  },
  
  /**
   * 显示弹框
   */
  showModal() {
    this.setData({
      showModalFlag: true
    });
  },

  /**
   * 隐藏弹框
   */
  hideModal() {
    this.setData({
      showModalFlag: false
    });
  },

  /**
   * 姓名输入处理
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  /**
   * 手机号输入处理
   */
  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  /**
   * 一键获取手机号
   */
  getPhoneNumber(e) {
    console.log('获取手机号:', e);
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
          console.log(res.data, "获取手机号成功");
          if (res.data.status && res.data.data) {
            this.setData({
              'formData.phone': res.data.data
            });
            wx.showToast({
              title: '获取手机号成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '获取手机号失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '获取手机号失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'none'
      });
    }
  },

  /**
   * 日期选择处理
   */
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    });
  },

  /**
   * 弹框表单提交
   */
  submitModalForm() {
    const { formData } = this.data;
    
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
    
    if (!formData.date) {
      wx.showToast({
        title: '请选择预约日期',
        icon: 'none'
      });
      return;
    }
    
    // 准备提交的数据
    const submitData = {
      xinmin: formData.name,
      mobile: formData.phone,
      prole: formData.date,
      typeid: 8,
      typename: '慧医宝微光卡预约'
    };

    // 发送表单数据到服务器
    req({
      url: util.baseUrl+'/newapi/api/huodong/tjwgk',
      method: 'POST',
      data: submitData,
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 清空表单并关闭弹框
          this.setData({
            showModalFlag: false,
            formData: {
              name: '',
              phone: '',
              prole: ''
            }
          });
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
      typename: '形耀星期三'
    };

    // 发送表单数据到服务器
    req({
      url: util.baseUrl+'/aiapi/api/xys/tjxys',
      method: 'POST',
      data: submitData,
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          });
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
    let that = this;
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id = arr[1]
    }
    if (options.sponsor) {
      wx.setStorageSync('sponsor', options.sponsor)
    }
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
      title: '"线上预约，到店无忧"',
      path: '/huodongpage/weiguangka/weiguangka?fromid=' + wx.getStorageSync('openid'),
      imageUrl: "https://wx.pmc-wz.com/materials/hmb/wgkftx.jpg"
    };
  }
  /**
   * 用户点击右上角分享
   */
})