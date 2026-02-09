const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');

Page({
  data: {
    qyxx: [],
    qtqy:null
  },
  onShow(){
    req({
      url: util.baseUrl + "/newapi/api/card/gethqorderpage",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 999
      },
      success: (res) => {
        console.log('card', res)
        this.setData({
          qyxx: res.data.data
        })
      }
    })
    req({
      url: util.baseUrl + "/newapi/api/card/getrightuser",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 999
      },
      success: (res) => {
        console.log('card', res)
        this.setData({
          qtqy: res.data.data
        })
        console.log('ss', this.data.qyxx)
      }
    })
  },
  onLoad: function (options) {
    // 页面加载时执行
    // console.log(wx.getStorageSync('openid'))
    
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