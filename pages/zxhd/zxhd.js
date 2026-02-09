// pages/zxhd/zxhd.js
const {
  req
} = require("../../utils/request")
const util = require('../../utils/util')
import drawQrcode from '../../utils/qrcode'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "ptype": 17,
    "mobile": "",
    "xinmin": "",
    "sex": "",
    "job": "",
    "age": "",
    "fromsource": "",
    shareUrl: "https://www.baidu.com/",
    shareQrcodeImage: "",
    shareQrcodeWidth: 200,
    shareQrcodeHeight: 200,
    haibaoBgUrl: "https://wx.pmc-wz.com/materials/codehb.png",
    haiBaoWidth: 750, //海报默认宽
    haiBaoHeight: 1334, //海报默认高
    haiBaoShowHeight: 0,
    qrcode_x: 600, //二维码据左上角x轴距离
    qrcode_y: 980, //二维码据左上角Y轴距离
    display: 'none',
    user_id: 1,
    options: {},
    shareList: [],
    showMyShareDisplay: 'none'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      options: options
    })
    wx.getSystemInfo({
      success(res) {
        that.setData({
          windowWidth: res.windowWidth / 1.2,
          windowHeight: res.windowHeight / 1.2
        })
      }
    });
  },
  submit() {
    if (!this.data.mobile || !this.data.xinmin || !this.data.sex || !this.data.job || !this.data.age) {
      wx.showToast({
        title: '信息请填写完整',
      })
      return;
    }
    let from = {
      "ptype": 17,
      "mobile": this.data.mobile,
      "xinmin": this.data.xinmin,
      "sex": this.data.sex,
      "job": this.data.job,
      "age": this.data.age,
      "fromsource": this.data.options.share ? this.data.options.share : "",
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../login/login',
            })
          }, 1000)
        }
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/mindex/tjpifu",
      method: "POST",
      data: {
        ...from,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (!res.data.status) {
          wx.showToast({
            title: res.data.data
          })
        } else {
          wx.showToast({
            title: '报名成功'
          })
        }
      }
    })
  },
  showMyShare() {
    req({
      url: util.baseUrl + "/newapi/api/mindex/getpifushare",
      method: "POST",
      data: {
        fromsource: wx.getStorageSync('openid')
      },
      success: (res) => {
        this.setData({
          shareList: res.data.data,
          showMyShareDisplay: 'block'
        })
      }
    })
  },
  createhaibao() {
    var this_ = this;
    let shareOpenid = wx.getStorageSync('openid');
    wx.showLoading({
      title: '生成中',
    })
    req({
      url: util.baseUrl + "/newapi/api/yinxiang/urllink",
      method: "POST",
      data: {
        url: "/pages/zxhd/zxhd",
        query: "share=" + shareOpenid,
        typeid: 1 //0长期 1短期
      },
      success: (res) => {
        if (res.data.data.msg === '生成失败') {
          wx.hideLoading({
            title: "生成二维码失败"
          })
          return;
        }
        this.setData({
          shareUrl: res.data.data
        }, () => {
          drawQrcode({
            width: 160,
            height: 160,
            x: 20,
            y: 20,
            canvasId: 'myQrcode',
            // ctx: wx.createCanvasContext('myQrcode'),
            typeNumber: 5,
            text: res.data.data, //二维码的链接携带个人信息，根据实际业余需求做修改
            image: {
              imageResource: 'https://wx.pmc-wz.com/materials/logo.png',
              dx: 70,
              dy: 70,
              dWidth: 60,
              dHeight: 60
            },
            callback(e) {
              // 导出图片
              setTimeout(() => {
                wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width: this_.data.shareQrcodeWidth,
                  height: this_.data.shareQrcodeHeight,
                  destWidth: this_.data.shareQrcodeWidth,
                  destHeight: this_.data.shareQrcodeHeight,
                  canvasId: 'myQrcode',
                  success(ress) {
                    let tempFilePath = ress.tempFilePath
                    this_.setData({
                      shareQrcodeImage: tempFilePath
                    })
                    this_.createHB()
                  }
                })
              }, 100)
            }
          })
        })

      }
    })
  },
  createHB: function (e) {
    var that = this;
    that.setData({
      display: 'block'
    });
    if (that.data.shareImgSrc) {
      //已画过就不再画
      wx.hideLoading({})
      return;
    }
    var imgUrl = that.data.haibaoBgUrl;
    var codeX = that.data.qrcode_x;
    var codeY = that.data.qrcode_y;

    wx.getImageInfo({
      src: imgUrl,
      success(res) {
        console.log("res.path:" + res.path)
        const ctx = wx.createCanvasContext('myCanvas');
        //二维码
        var qrcodeImg = that.data.shareQrcodeImage;
        // 海报显示最大宽高
        var screenW = that.data.windowWidth - 30;
        var screenH = that.data.windowHeight - 30;
        var bgW = res.width; // 海报实际宽
        var bgH = res.height; // 海报实际宽

        var haiBaoShowWidth_ = screenW;
        var haiBaoShowHeight_ = screenH
        if (bgW < screenW) {
          haiBaoShowWidth_ = bgW;
        }
        // 按宽度等比缩放的高
        var sjht = bgH * haiBaoShowWidth_ / bgW;
        if (sjht < screenH) {
          haiBaoShowHeight_ = sjht;
        }
        that.setData({
          haiBaoWidth: res.width,
          haiBaoHeight: res.height,
          haiBaoShowWidth: haiBaoShowWidth_,
          haiBaoShowHeight: haiBaoShowHeight_
        })
        //画海报底图
        ctx.drawImage(res.path, 0, 0, that.data.haiBaoWidth, that.data.haiBaoHeight);
        //画海报二维码，海报宽高200*200，坐标减去20是方便二维码的白边显示，可去掉
        ctx.drawImage(qrcodeImg, 300,1780, 200, 200)
        //canvasToTempFilePath必须要在draw的回调中执行，否则会生成失败，官方文档有说明
        ctx.draw(false, setTimeout(function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            canvasId: 'myCanvas',
            success: function (res) {
              wx.hideLoading();
              that.setData({
                shareImgSrc: res.tempFilePath
              })
            },
            fail: function (res) {
              wx.hideLoading();
              wx.showToast({
                title: '生成失败',
                icon: "none"
              })
            }
          })
        }, 200));
      }
    })
  },
  savePic: function () {
    var that = this;
    getAuto(function () {
      wx.saveImageToPhotosAlbum({
        filePath: that.data.shareImgSrc,
        success: function (res) {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: function (res) {
          wx.showToast({
            title: '保存失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    })

  },
  closeShare() {
    this.setData({
      showMyShareDisplay: 'none'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  hideModal: function () {
    this.setData({
      display: "none",
      position: ""
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

function getAuto(_success) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            _success();
          }
        })
      } else {
        _success();
      }
    }
  })
}