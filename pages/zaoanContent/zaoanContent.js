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
    islogin: false,
    options: {},
    ggid: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      this.setData({
        ggid: arr[1],

      },()=>{
        req({
          url: util.baseUrl + "/newapi/api/member/getpicture",
          method: "POST",
          data: {
            id: this.data.ggid
          },
          success: res => {
            this.setData({
              item: res.data.data
            })
            this.getmin()
          }
        })
      })
    } else {
      this.setData({
        item: options
      },()=>{
        this.getmin()
      })
      
    }
  },
  getmin(){
    let that=this;
    let id = this.data.item.id ? this.data.item.id : this.data.ggid;
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: this.data.item.jumpurl?this.data.item.jumpurl:'pages/zaoanContent/zaoanContent',
        query: wx.getStorageSync('openid') + '&' + id,
        "typeid": 0,
        openid: wx.getStorageSync('openid'),
        iftrans:parseInt(this.data.item.kc)
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
  },
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterSrc,
      success: res => {
        console.log(res)
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
        width: 750,
        height: 1467,
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
          width: 750,
          height: 1467,
          x: 0,
          y: 0,
          url: 'https://wx.pmc-wz.com/hyb/images/' + that.data.item.haibao,
        }, {
          width: 150,
          height: 150,
          x: parseInt(that.data.item.xpos),
          y: parseInt(that.data.item.ypos),
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
            wx.navigateTo({
              url: '../lxkf/lxkf'
            })
          } else {
            wx.requestSubscribeMessage({
              tmplIds: ['Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU'],
              success: res => {
                wx.navigateTo({
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
  onShow(options) {
    let userInfo = wx.getStorageSync('userInfo');
    
    if (userInfo) { //登录拦截
      this.setData({
        islogin: true
      })
    }
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    //获取小程序码 

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