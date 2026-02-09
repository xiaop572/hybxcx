// pages/zaoan/zaoan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    posterConfig: {},
    posterSrc: "",
    qrcodeSrc: "",
    loading: false,
    islogin:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    if (options.scene) {
      wx.setStorageSync('sponsor', options.scene)
    }
  },
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterSrc,
      success: res => {
        req({
          url:util.baseUrl+"/newapi/api/bl/savezaoanview",
          method:"post",
          data:{
            useropenid:wx.getStorageSync('openid'),
            pageurl:this.data.item.haibao,
            query:this.data.item.pictitle
          }
        })
      }
    })
  },
  close() {
    this.setData({
      posterSrc: ""
    })
  },
  test() {

  },
  createHai() {
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
    if (!this.data.loading) {
      return;
    }
    let that = this;
    this.setData({
      posterConfig: {
        width: 751,
        height: 1557,
        backgroundColor: '#ffffff',
        debug: false,
        pixelRatio: 1,
        blocks: [],
        texts: [{
            x: 59,
            y: 895,
            baseLine: 'middle',
            text: []
          },
          {
            x: 59,
            y: 945,
            baseLine: 'middle',
            text: []
          }
        ],
        images: [{
          width: 751,
          height: 1557,
          x: 0,
          y: 0,
          url: 'https://wx.pmc-wz.com/hyb/images/' + that.data.item.haibao,
        }, {
          width: 180,
          height: 180,
          x:90,
          y: 1320,
          url: that.data.qrcodeSrc,
        }]
      }
    })
  },
  rhome() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  getDay() {
    let day = new Date().getDay()
    let week;
    switch (day) {
      case 0:
        week = "星期天"
        break;
      case 1:
        week = "星期一"
        break;
      case 2:
        week = "星期二"
        break;
      case 3:
        week = "星期三"
        break;
      case 4:
        week = "星期四"
        break;
      case 5:
        week = "星期五"
        break;
      case 6:
        week = "星期六"
        break;
    }
    return week;
  },
  onPosterSuccess(e) { // 海报生成成功
    this.setData({
      posterSrc: e.detail,
      showpops: false,
      showPoster: true,
    })
    const {
      detail
    } = e;
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
                req({
                  url:util.baseUrl+"/newapi/api/subt/usersubt",
                  method:"POST",
                  data:{
                    templateid:"Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU",
                    openid:wx.getStorageSync('openid')
                  }
                })
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
  onPosterFail(err) {
    wx.showToast({
      title: '生成失败',
    })
  },

  savePoster() { // 点击保存到手机相册

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
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) { //登录拦截
      this.setData({
        islogin:true
      })
    }
    let that=this;
    wx.showLoading({
      title: '加载中',
    })
    //获取小程序码 
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: "pages/zaoan/zaoan",
        query: wx.getStorageSync('openid'),
        "typeid": 0,
        openid:wx.getStorageSync('openid')
      },  
      success: res => {
        //base64转换成图片
        util.base64src("data:image/jpg;base64," + res.data.data, function (e) {
          that.setData({
            qrcodeSrc: e
          })
          wx.hideLoading({
            success: (res) => {
              that.setData({
                loading: true
              })
            },
          })
        })
      }
    })
    req({
      url: util.baseUrl + "/newapi/api/member/zaoanlist",
      method: "POST",
      data: {
        curpage: 1,
        limit: 9999
      },
      success: res => {
        let day = this.getDay();
        res.data.data.forEach(item => {
          if (item.pictitle === day) {
            this.setData({
              item
            })
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