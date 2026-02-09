
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({
  data: {
    card: '',
    pwd: '',
    name: ''
  },
  rmycard(){
    wx.navigateTo({
      url: '/subpackages/mycard/mycard',
    })
  },
  handleSubmit() {
    const {
      card,
      pwd,
      name
    } = this.data;


    if (!pwd.trim()) {
      wx.showToast({
        title: '请输入权益码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    });

    req({
      url: util.baseUrl + '/newapi/api/card/gethuaqiaocard',
      method: 'POST',
      data: {
        card: "",
        pwd: pwd.trim(),
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showModal({
            title: '领取成功',
            content: res.data.msg,
            complete: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/subpackages/mycard/mycard',
                })
              }
            }
          })

          // 清空表单
          this.setData({
            pwd: ''
          });
        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
})