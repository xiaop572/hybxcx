// pages/tcxq/tcxq.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

var wxParse = require("../../wxParse/wxParse/wxParse.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {
    },
    imgHeight: 0,
    options: {},
    specVis: false,
    spec: "",
    posterConfig: {},
    qrcodeSrc: "",
    posterSrc:"",
    loading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let that = this;
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    wx.showLoading({
      title: '加载中...',
    })
    req({
      url: util.baseUrl + "/newapi/api/prom/getpromyjgoods",
      method: "GET",
      data: {
        id: options.id
      },
      success: res => {
        if (res.data.data.isdelete !== 0) {
          wx.showToast({
            title: '该产品已下架',
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '../qyProList/qyProList',
            })
          }, 1000)
        }
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data
        },()=>{
          this.createhaibao()
        })
        req({
          url: util.baseUrl + "/newapi/api/hd/productview",
          method: "POST",
          data: {
            useropenid: wx.getStorageSync('openid'),
            proid: res.data.data.id
          }
        })
        wxParse.wxParse('courseDetail', 'html', res.data.data.detail, that, 5)
        wx.getImageInfo({
          src: "https://wx.pmc-wz.com/hyb/images/" + res.data.data.picurl,
          success: ress => {
            wx.getSystemInfo({
              success: (result) => {
                let scrHeight = result.windowWidth / ress.width * ress.height
                this.setData({
                  imgHeight: scrHeight
                })
              },
            })

          }
        })
      }
    })
  },
  selSpec(e) {
    this.setData({
      spec: e.currentTarget.dataset.spec
    })
  },
  rqiyeHome() {
    wx.navigateTo({
      url: '../qyProList/qyProList',
    })
  },
  rlxkf() {
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
    } else {
      wx.getSetting({
        withSubscriptions: true,
        success: res => {
          if (res.subscriptionsSetting.Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU === "accept") {
            wx.switchTab({
              url: '../lxkf/lxkf'
            })
          } else {
            wx.requestSubscribeMessage({
              tmplIds: ['Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU'],
              success: res => {
                wx.switchTab({
                  url: '../lxkf/lxkf'
                })
              }
            })
          }
        }
      })
    }
  },
  close() {
    this.setData({
      posterSrc: ""
    })
  },
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterSrc,
      success: res => {
        console.log(res)
        wx.showToast({
          title: '保存成功',
        })
      },
      fail:res=>{
        wx.showToast({
          title: '保存失败',
        })
      }
    })
  },
  cancelSec() {
    this.setData({
      specVis: false
    })
  },
  createhaibao() {
    let that = this;
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: 'pages/tcxq/tcxq',
        query: wx.getStorageSync('bankpos') + '&' + this.data.item.id,
        "typeid": 0,
        openid: wx.getStorageSync('openid'),
        iftrans: 0
      },
      success: res => {
       
        //base64转换成图片
        util.base64src("data:image/jpg;base64," + res.data.data, function (e) {
          that.setData({
            qrcodeSrc: e
          }, () => {
            that.setData({
              posterConfig: {
                width: 750,
                height: 1200,
                backgroundColor: '#ffffff',
                debug: false,
                pixelRatio: 1,
                blocks: [],
                texts: [{
                    x: 59,
                    y: 840,
                    baseLine: 'middle',
                    text: that.data.item.pictitle,
                    fontSize: 44,
                    fontWeight: '400',
                    color: '#000',
                  },
                  {
                    x: 59,
                    y: 920,
                    baseLine: 'middle',
                    text: '¥' + that.data.item.price,
                    fontSize: 38,
                    fontWeight: '400',
                    color: 'red',
                  },
                  {
                    x: 59,
                    y: 1100,
                    baseLine: 'middle',
                    text: '扫一扫查看更多详情',
                    fontSize: 36,
                    fontWeight: '400',
                    color: '#000',
                  },
                ],
                images: [{
                  width: 750,
                  height: 750,
                  x: 0,
                  y: 0,
                  url: 'https://wx.pmc-wz.com/hyb/images/' + that.data.item.picurl,
                }, {
                  width: 180,
                  height: 180,
                  x: 520,
                  y: 980,
                  url: that.data.qrcodeSrc,
                }]
              }
            },()=>{
              wx.hideLoading({
                success: (res) => {
                  that.setData({
                    loading:true
                  })
                },
              })
            })
          })
        })
      }
    })

  },
  onPosterSuccess(e) { // 海报生成成功
    console.log(e)
    this.setData({
      posterSrc: e.detail,
    })
    const {
      detail
    } = e;
  },
  onPosterFail(e) {
    console.log(e,"??")
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
    let that = this;
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
  rbuy(e) {
    if (this.data.item.spec.length > 0) {
      this.setData({
        specVis: true
      })
      return;
    }
    this.prepaygoods()
  },
  specBuy() {
    if (!this.data.spec) {
      wx.showToast({
        title: "请选择规格"
      })
      return;
    }
    this.prepaygoods()
  },
  prepaygoods() {
    let app = getApp();
    app.globalData.tc = this.data.item;
    app.globalData.tc.selSpec = this.data.spec
    req({
      url: util.baseUrl + "/newapi/api/goods/prepaygoods",
      method: "POST",
      data: {
        orderTitle: this.data.item.pictitle,
        openId: wx.getStorageSync('openid'),
        ptype: this.data.item.ptype,
        proid: this.data.item.id
      },
      success: (res) => {
        if (res.data.status) {
          wx.myNavigateTo({
            url: '../jiesuan/jiesuan',
          })
        } else {
          wx.showModal({
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  setshare(e) {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    return {
      title: "您的好友给您分享了一个产品",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/pages/tcxq/tcxq?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  },
  onShareTimeline(e) {
    return {
      title: "您的好友给您分享了一个产品",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/pages/tcxq/tcxq?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  }
})