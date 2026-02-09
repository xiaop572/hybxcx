const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
// subpackages/ytbm/ytbm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeid: 0,
    xinmin: "",
    mobile: "",
    corp: "",
    watchMode: "outside" // 默认选择外场观看
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.typeid === 0) {
      wx.navigateTo({
        url: '../ytbmsel/ytbmsel',
      })
      return;
    }
    this.setData({
      typeid: options.typeid //场外1 场内2
    })
  },

  /**
   * 选择观看方式
   */
  selectWatchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      watchMode: mode
    });
  },
  bm() {
    if (!this.data.xinmin || !this.data.mobile || !this.data.corp) {
      wx.showToast({
        title: '请填写完整信息',
      })
      return;
    }
    // 外场观看免费报名
    this.bmsub(3)
  },
  zf() {
    if (!this.data.xinmin || !this.data.mobile || !this.data.corp) {
      wx.showToast({
        title: '请填写完整信息',
      })
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    req({
      url: util.baseUrl + "/newapi/api/sm/prepayoper",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        xinmin: this.data.xinmin,
        mobile: this.data.mobile,
        corp: this.data.corp,
        OutTradeNo: String(+new Date()),
        typeid: this.data.watchMode === 'inside' ? 8 : 1 // 内场支付使用typeid=8，外场使用typeid=1
      },
      success: res => {
        if (!res.data.status) {
          wx.hideLoading({})
          wx.showModal({
            title:"提示",
            content: res.data.data,
            showCancel: false
          })
          return;
        }
        wx.hideLoading({})
        wx.requestPayment({
          ...res.data.data,
          success: (ress) => {
            if (ress.errMsg === "requestPayment:ok") {
              wx.showModal({
                title: '提示',
                content: res.data.otherData,
                showCancel:false,
                complete: (res) => {
                }
              })
              
            }
          },
          fail(res) {

          }
        })
      }
    })
  },
  bmsub(id) {
    req({
      url: util.baseUrl + "/newapi/api/sm/ytfreeoper",
      method: "POST",
      data: {
        xinmin: this.data.xinmin,
        mobile: this.data.mobile,
        corp: this.data.corp,
        typeid: id
      },
      success: res => {
        console.log(res)
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: res.data.otherData,
            showCancel:false,
            complete: (res) => {
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false
          })
        }
      }
    })
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

  }
})