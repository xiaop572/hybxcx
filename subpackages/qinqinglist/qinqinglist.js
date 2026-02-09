// subpackages/qinqinglist/qinqinglist.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    personlist: [],
    currentBr: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},
  getbindyy() {
    req({
      url: util.baseUrl + "/newapi/api/yyda/bindyylist",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            personlist: res.data.data
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
    this.gettopyyinfo()
    this.getbindyy()
  },
  gettopyyinfo() {
    req({
      url: util.baseUrl + "/newapi/api/yyda/topyyinfo",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            currentBr: res.data.data[0]
          })
        }
      }
    })
  },
  settopyy(e) {
    let data = e.currentTarget.dataset
    req({
      url: util.baseUrl + "/newapi/api/yyda/sztopyyinfo",
      method: "POST",
      data: {
        brxm: data.brxm,
        yddh: data.yddh,
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        console.log(res)
        if (res.data.status) {
          this.getbindyy()
          this.gettopyyinfo()
        }
      }
    })
  },
  cancel(e) {
    let data = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '是否解绑该卡？',
      complete: (res) => {
        if (res.confirm) {
          req({
            url: util.baseUrl + "/newapi/api/yyda/cancelbindyyinfo",
            method: "POST",
            data: {
              brxm: data.brxm,
              yddh: data.yddh,
              openid: wx.getStorageSync('openid')
            },
            success: ress => {
              if (ress.data.status) {
                this.getbindyy()
                this.gettopyyinfo()
                wx.showToast({
                  title: ress.data.msg,
                })
              }
            }
          })
        }
      }
    })
  },
  addjzr() {
    wx.navigateTo({
      url: '../addqinqing/addqinqing',
    })
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