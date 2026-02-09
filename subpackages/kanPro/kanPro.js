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
      picurl: "202210/9a374076769b445582c2118565424c30.jpg"
    },
    imgHeight: 0,
    options: {},
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0,
    endtime: 0,
    timer: null,
    show: false,
    posterConfig: {
      debug: false
    },
    posterSrc: "",
    qrcodeSrc:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let that = this;
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id=arr[1]
    }
    req({
      url: util.baseUrl + "/newapi/api/kanjia/getonekanjia",
      method: "GET",
      data: {
        id: options.id
      },
      success: res => {
        // if (res.data.data.isdelete !== 0) {
        //   wx.showToast({
        //     title: '该产品已下架',
        //   })
        //   setTimeout(() => {
        //     wx.switchTab({
        //       url: '../../pages/index/index',
        //     })
        //   }, 1000)
        // }
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data,
          endtime: new Date(res.data.data.enddate).getTime()
        }, () => {
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
        if (res.data.data.detail) {
          wxParse.wxParse('courseDetail', 'html', res.data.data.detail, that, 5)
        }
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
        this.data.timer = setInterval(() => {
          let timeArr = util.intervalTime(new Date().getTime(), this.data.endtime);
          if (!timeArr) {
            clearInterval(this.data.timer)
          }
          that.setData({
            day: timeArr[0],
            hour: timeArr[1],
            minute: timeArr[2],
            seconds: timeArr[3]
          })
        }, 1000)
      }
    })
  },
  showfx() {
    this.setData({
      show: !this.data.show
    })
  },
  cancel() {

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
  createhaibao() {
    let that = this;
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: 'subpackages/kanPro/kanPro',
        query: wx.getStorageSync('openid') + '&' + this.data.item.id,
        "typeid": 0,
        openid: wx.getStorageSync('openid'),
        iftrans:0
      },
      success: res => {
        //base64转换成图片
        util.base64src("data:image/jpg;base64," + res.data.data, function (e) {
          that.setData({
            qrcodeSrc: e
          },()=>{
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
                    x: 189,
                    y: 920,
                    baseLine: 'middle',
                    text: '¥' + that.data.item.pointsDeduction,
                    fontSize: 36,
                    fontWeight: '400',
                    color: '#999',
                    textDecoration: 'line-through'
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
                },{
                  width: 180,
                  height: 180,
                  x: 520,
                  y: 980,
                  url: that.data.qrcodeSrc,
                }]
              }
            })
          })
        })
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  close() {
    this.setData({
      posterSrc: ""
    })
  },
  rkanState(e) {
    if (new Date(this.data.endtime).getTime() < new Date().getTime()) {
      wx.showToast({
        title: '该活动已结束',
      })
      return;
    }
    wx.myNavigateToz({
      url: '../kanState/kanState?proid=' + e.currentTarget.dataset.item.id + '&helpOpenid=' + wx.getStorageSync('openid'),
      // url: '../kanState/kanState?proid=5&helpOpenid=oEJsU5LvZrKoKFJ5UOh-tv4sGVeI',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(this.data.timer);
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
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterSrc,
      success: res => {
        console.log(res)
      }
    })
  },
  setshare(e) {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    return {
      title: "您的好友给您分享了一个产品",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/subpackages/kanPro/kanPro?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  }
})