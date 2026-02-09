// subpackages/mzycjiaofei/mzycjiaofei.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zyhm:"",
    je:0,
    zhlx: "wechat",
    brinfo:{

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(!options.sponsor){
      wx.showToast({
        title: '数据出错',
      })
      return;
    }
    this.setData({
      zyhm:options.sponsor,
      je:options.je
    })
  },
  zhifu(){
    req({
      url: util.baseUrl + "/newapi/api/zy/addinzhye",
      method: "post",
      data: {
        brbm: "",
        zhlx: this.data.zhlx,
        zyh: Number(this.data.brinfo.ZYH),
        zhbm: wx.getStorageSync('openid'),
        je: parseFloat(this.data.je),
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        wx.requestPayment({
          ...res.data.data,
          success: (ress) => {
            console.log(ress)
            if (ress.errMsg === "requestPayment:ok") {
              wx.showToast({
                title: '支付成功'
              })
              setTimeout(() => {
                wx.redirectTo({
                  url: '../zfcg/zfcg',
                })
              }, 1000);
            }
          },
          fail(res) {

          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  next() {
    req({
      url: util.baseUrl + "/newapi/api/zy/getzyinfo",
      method: "post",
      data: {
        zyhm: this.data.zyhm
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            brinfo: res.data.data
          })
        }else{
          wx.showToast({
            title: '查询失败',
          })
        }
      }
    })
    return;
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.next()
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