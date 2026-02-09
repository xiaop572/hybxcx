const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({
  data: {
    packages: [{
        title: '高端体检套餐',
        price: 2588,
        features: [
          '专业医师全程指导',
          '全面体检项目',
          '精准健康评估',
          '个性化健康建议'
        ]
      },
      {
        title: '智能超声炮',
        price: 1980,
        features: [
          '先进超声波技术',
          '精准定位治疗',
          '无创无痛',
          '快速恢复'
        ]
      },
      {
        title: '美白洁牙',
        price: 600,
        features: [
          '专业洁牙护理',
          '去除牙渍污垢',
          '美白亮齿',
          '口腔健康维护'
        ]
      }
    ],
    pwd: '',
    xinmin: ""
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  onShow() {
    // 页面显示时的逻辑
  },

  handleSubmit() {
    const {
      xinmin,
      pwd
    } = this.data;
    if (!xinmin) {
      wx.showToast({
        title: '请输入权益码',
        icon: 'none'
      });
      return;
    }
    if (!pwd) {
      wx.showToast({
        title: '请输入权益码',
        icon: 'none'
      });
      return;
    }


    // 模拟权益码验证和领取逻辑
    wx.showLoading({
      title: '正在验证'
    });
    req({
      url: util.baseUrl + "/newapi/api/card/checkhqcard",
      method: "post",
      data: {
        xinmin,
        pwd,
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        wx.hideLoading()
        if (res.data.status) { // 这里替换为实际的权益码验证逻辑
          wx.showToast({
            title: res.data.msg,
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/subpackagesC/fsrlq/fsrlq?id='+res.data.data.id,
            })
          }, 1000);
          this.setData({
            xinmin: "",
            pwd: ''
          });
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false,
          })
        }
      }
    })
  }
})