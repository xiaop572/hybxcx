const {
  req
} = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    name1: '',
    name2: '',
    code1: '',
    code2: '',
    id: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
    } else {
      wx.showToast({
        title: '网络错误',
      })
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }, 1000);
    }
    // 页面加载时的逻辑
  },

  handleSubmit() {
    const {
      name1,
      name2,
      code1,
      code2
    } = this.data;





    // 提交表单
    wx.showLoading({
      title: '正在提交'
    });

    req({
      url: util.baseUrl + '/newapi/api/card/savehqcard',
      method: 'POST',
      data: {
        type1: name1,
        type2: name2,
        type3: code1,
        type4: code2,
        id: this.data.id,
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        wx.hideLoading();
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            complete: ress => {
              setTimeout(() => {
                wx.redirectTo({
                  url: '/subpackagesC/tcjs/tcjs',
                })
              }, 1000);
            }
          })
         
          // 清空表单
          this.setData({
            name1: '',
            name2: '',
            code1: '',
            code2: ''
          });

        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
});