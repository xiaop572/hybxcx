const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');


Page({
  data: {
    jhm: ""
  },
  onShow: () => {
    // 页面加载时执行
    console.log(wx.getStorageSync('openid'))
    req({
      url: util.baseUrl + "/newapi/api/card/checkHasAccount",
      method: "GET",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status == true) {
          wx.redirectTo({
            url: '/subpackagesDDD/qyzx/qyzx',
          })
        }
      }
    })
  },

  onLoad: function (options) {


  },


  // 立即领取按钮点击事件
  handleActivate() {
    const jhm = this.data.jhm
    if (!this.data.jhm) {
      wx.showToast({
        title: '请输入激活码',
        icon: 'none'
      });
      return;
    } else {
      req({
        url: util.baseUrl + "/newapi/api/card/checkjhm",
        method: "POST",
        data: {
          openid: wx.getStorageSync('openid'),
          pwd: jhm
        },
        success: (res) => {
          // console.log(res)
          const jhm = this.data.jhm
          if (res.data.status) {
            wx.showToast({
              title: '正在验证激活码',
            })
            console.log(jhm)
            wx.redirectTo({
              url: '../688xxtx/688xxtx?param=' + JSON.stringify({
                jhm: this.data.jhm
              })
            })
          } else {
            wx.showToast({
              title: '激活码已使用',
            })
          }
        }

      })
    }
  }
})