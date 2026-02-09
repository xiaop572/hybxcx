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

  },

  onLoad: function (options) {


  },


  // 立即领取按钮点击事件
  handleActivate() {
    const jhm = this.data.jhm
    if (!this.data.jhm) {
      wx.showToast({
        title: '请输入卡号',
        icon: 'none'
      });
      return;
    } else {
      req({
        url: util.baseUrl + "/newapi/api/card/gethqorder2cardno",
        method: "POST",
        data: {
          openid: wx.getStorageSync('openid'),
          cardno: jhm,
          curpage: 1,
          limit: 9999
        },
        success: (res) => {
          let data = res.data.data;
          if (data.length <= 0) {
            wx.showModal({
              title: '提示',
              content: '此卡号不存在',
              showCancel: false
            })
          } else {
            wx.navigateTo({
              url: '/subpackagesDDD/cardpriv/cardpriv?cardno=' + jhm,
            })
          }
        }

      })
    }
  }
})