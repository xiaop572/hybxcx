// subpackages/sfyjiaofei/sfyjiaofei.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
import drawQrcode from '../../utils/qrcode'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brbm: "",
    je: "",
    zhlx: "wechat",
    brinfo: {

    }
  },
  next() {
    req({
      url: util.baseUrl + "/newapi/api/zy/getzyinfo",
      method: "post",
      data: {
        zyhm: this.data.brbm
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            brinfo: res.data.data
          })
          this.createQr(res.data.data)
        }else{
          wx.showToast({
            title: '查询失败',
          })
        }
      }
    })
    return;
  },
  createQr(sponsor) {
    let that = this;
    let text = "https://wx.pmc-wz.com/tranqrcode/?typeid=0&url=subpackages/mzycjiaofei/mzycjiaofei&query=sponsor=" + sponsor.ZYHM+";je="+this.data.je;
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'myQrcode',
      // ctx: wx.createCanvasContext('myQrcode'),
      text: text,
      image: {
        imageResource: this.data.tbsrc,
        dx: 80,
        dy: 80,
        dWidth: 40,
        dHeight: 40
      },
      callback: (e) => {
        that.setData({
          imgsrc: "!"
        })
      }
      // v1.0.0+版本支持在二维码上绘制图片
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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