const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');

Page({
  data: {
    qyxx: [],
    cardpriv:""
  },

  onLoad: function (options) {
    console.log(options)
    let cardno=options.cardno;
    if(!cardno){
      wx.showToast({
        title: '请输入卡号查询',
      })
     setTimeout(() => {
      wx.redirectTo({
        url: '/subpackagesDDD/selcard/selcard',
      })
     }, 1500);
      return;
    }
    // 页面加载时执行
    // console.log(wx.getStorageSync('openid'))
    req({
      url: util.baseUrl + "/newapi/api/card/gethqorder2cardno",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
          cardno: cardno,
          curpage: 1,
          limit: 9999
      },
      success: (res) => {
        console.log('card', res)
        this.setData({
          qyxx: res.data.data
        })
        console.log('ss', this.data.qyxx)
      }
    })
    req({
      url: util.baseUrl + "/newapi/api/card/getcardpriv",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
          cardno: cardno
      },
      success: (res) => {
        this.setData({
          cardpriv:res.data.data
        })
        console.log('ss', this.data.qyxx)
      }
    })
  },
  onUnload(event) {},
  // 核销码按钮点击事件
  handleHexiao: function (e) {
    wx.showToast({
      title: '正在生成核销码',
      icon: 'loading',
      duration: 1000
    });
    wx.navigateTo({
      url: '/pages/kaqrcode/kaqrcode?orderno=' + e.currentTarget.dataset.orderno + '&price=' + e.currentTarget.dataset.price + '&goodsname=' + e.currentTarget.dataset.goodsname + "&imgsrc=" + e.currentTarget.dataset.imgsrc + "&id=" + e.currentTarget.dataset.ids + "&deli=" + e.currentTarget.dataset.deli + "&xinmin=" + e.currentTarget.dataset.xinmin + "&picurl=" + e.currentTarget.dataset.picurl + '&paytime=' + e.currentTarget.dataset.paytime + "&spec=" + e.currentTarget.dataset.spec + "&iftui=" + e.currentTarget.dataset.iftui,
    })
    console.log('index', e)
  }
})