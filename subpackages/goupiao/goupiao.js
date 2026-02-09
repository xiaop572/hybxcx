// subpackages/goupiao/goupiao.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    jginfo:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      options: options
    })
    this.getjginfo()
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
  getjginfo(){
    req({
      url:util.baseUrl+"/newapi/api/sm/getjginfo",
      method:"GET",
      success:res=>{
        this.setData({
          jginfo:res.data.data
        })
      }
    })
  },
  submit() {
    console.log(+new Date())
    req({
      url: util.baseUrl + "/newapi/api/sm/prepayoper",
      method: "POST",
      data: {
        OutTradeNo: "xf" + (+new Date()),
        openId: wx.getStorageSync('openid'),
        ...this.data.options,
        typeid: 0
      },
      success: res => {
        if(!res.data.status){
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false
          })
          return;
        }
        wx.requestPayment({
          ...res.data.data,
          success: (ress) => {
            if (ress.errMsg === "requestPayment:ok") {
              wx.showToast({
                title: '支付成功'
              })
              wx.showModal({
                title: '提示',
                content: '支付成功',
                showCancel: false,
                success: res => {
                  wx.redirectTo({
                    url: '../hdbm/hdbm',
                  })
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