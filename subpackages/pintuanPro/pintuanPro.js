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
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0,
    endtime: 0,
    timer: null,
    msvis: true,
    qrcodeSrc: "",
    posterSrc: "",
    userInfo: {},
    qrinfo: {},
    tmlist: [],
    tmtimer: null,
    rollnum: 0,
    rolllist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    let date = new Date();
    let hours = date.getHours();
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id = arr[1]
    }
    req({
      url: util.baseUrl + "/newapi/api/pt/getonepintuan",
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
            wx.switchTab({
              url: '../../pages/index/index',
            })
          }, 1000)
        }
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data,
          endtime: res.data.data.enddate
        }, () => {
          this.createhaibao()
          req({
            url:util.baseUrl+"/newapi/api/pt/getrollinfo",
            method:"GET",
            data:{
              num:this.data.item.id
            },
            success:(res)=>{
              this.setData({
                rolllist:res.data.data
              })
            }
          })
        })
        req({
          url: util.baseUrl + "/frontapi/api/hd/productview",
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
                this.inttm()
              },
            })

          }
        })
      }
    })
    
  },
  createhaibao() {
    let that = this;
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: 'subpackages/pintuanPro/pintuanPro',
        query: wx.getStorageSync('openid').slice(4) + '&' + this.data.item.id,
        "typeid": 0,
        openid: wx.getStorageSync('openid'),
        iftrans: 1
      },
      success: res => {
        //base64转换成图片
        util.base64src("data:image/jpg;base64," + res.data.data, function (e) {
          that.setData({
            qrcodeSrc: e
          }, () => {
            that.setData({
              posterConfig: {
                width: 800,
                height: 1450,
                backgroundColor: '#ffffff',
                debug: false,
                pixelRatio: 1,
                blocks: [{
                  x: 70,
                  y: 1010,
                  height: 60,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  paddingLeft: 5,
                  paddingRight: 5,
                  text: {
                    baseLine: 'middle',
                    text: '2人团',
                    fontSize: 34,
                    fontWeight: '400',
                    color: '#1b2c62',
                    lineHeight: 40,
                    baseLine: 'middle',
                    textAlign: 'center'
                  },
                }],
                texts: [{
                    x: 200,
                    y: 1042,
                    baseLine: 'middle',
                    text: that.data.item.pictitle,
                    fontSize: 40,
                    fontWeight: '400',
                    color: '#fff',
                  },
                  {
                    x: 70,
                    y: 1140,
                    baseLine: 'middle',
                    text: '¥' + that.data.item.price,
                    fontSize: 60,
                    fontWeight: '400',
                    color: '#fff',
                  },
                  {
                    x: 560,
                    y: 1140,
                    baseLine: 'middle',
                    text: '原价¥' + that.data.item.pointsDeduction,
                    fontSize: 32,
                    fontWeight: '400',
                    color: '#fff',
                    textDecoration: 'line-through'
                  },
                  {
                    x: 200,
                    y: 1250,
                    baseLine: 'middle',
                    text: (that.data.qrinfo.nickname ? that.data.qrinfo.nickname : '微信用户') + "邀你一起狂欢购",
                    fontSize: 28,
                    fontWeight: '400',
                    color: '#fff',
                  },
                  {
                    x: 200,
                    y: 1320,
                    baseLine: 'middle',
                    text: "长按二维码参与",
                    fontSize: 28,
                    fontWeight: '400',
                    color: '#fff',
                  },
                ],
                images: [{
                    width: 800,
                    height: 1450,
                    x: 0,
                    y: 0,
                    url: 'https://wx.pmc-wz.com/hyb/images/' + that.data.item.haibao,
                  }, {
                    width: 160,
                    height: 160,
                    x: 560,
                    y: 1180,
                    url: that.data.qrcodeSrc,
                  },
                  {
                    width: 110,
                    height: 110,
                    x: 60,
                    y: 1228,
                    url: that.data.userInfo.avatarUrl,
                    borderRadius: 110
                  }
                ]
              }
            })
          })
        })
      }
    })

  },
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterSrc,
      success: res => {
        wx.showToast({
          title: '保存成功',
        })
      }
    })
  },
  rptbuy(e) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../../pages/login/login',
            })
          }, 1000)
        }
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/pt/getptmainid",
      method: "GET",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.myNavigateToz({
            url: '../pintuanbuy/pintuanbuy?id=' + this.data.item.id + "&ptid=" + res.data.data.ptid,
          })
        } else {
          let app = getApp();
          app.globalData.pttc = e.currentTarget.dataset.item
          wx.setStorageSync('ptid', 0)
          wx.myNavigateToz({
            url: "../ptjiesuan/ptjiesuan"
          })
        }
      }
    })
  },
  gopd(e){
    console.log(e,"??")
    wx.myNavigateToz({
      url: '../pintuanbuy/pintuanbuy?id=' + this.data.item.id + "&ptid=" + e.currentTarget.dataset.id,
    })
  },
  rmypt() {
    req({
      url: util.baseUrl + "/newapi/api/pt/getptmainid",
      method: "GET",
      data: {
        openid: wx.getStorageSync('openid'),
        proid:this.data.item.id
      },
      success: (res) => {
        if (res.data.status) {
          wx.myNavigateToz({
            url: '../pintuanbuy/pintuanbuy?id=' + this.data.item.id + "&ptid=" + res.data.data.ptid,
          })
        } else {
          wx.showToast({
            title: '您还没有开团',
          })
        }
      }
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
              url: '../../pages/login/login',
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
  onPosterSuccess(e) { // 海报生成成功
    console.log(e)
    this.setData({
      posterSrc: e.detail,
    })
    const {
      detail
    } = e;
  },
  onPosterFail(err) {
    wx.showToast({
      title: '生成失败',
    })
  },
  close() {
    this.setData({
      posterSrc: ""
    })
  },
  rtest() {

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
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      qrinfo: wx.getStorageSync('qrinfo')
    })
    //倒计时
    this.data.timer = setInterval(() => {
      let timeArr = util.intervalTime(new Date().getTime(), new Date(this.data.endtime));
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
    let timer = setInterval(() => {
       if(this.data.rollnum<this.data.rolllist.length){
         this.setData({
           rollnum:this.data.rollnum+1
         })
       }else{
         this.setData({
           rollnum:0
         })
       }
    }, 4000);
    this.setData({
      tmtimer: timer
    })
  },
  inttm() {
    req({
      url: util.baseUrl + "/newapi/api/pt/getdanmuinfo",
      method: "GET",
      data: {
        num: 20
      },
      success: (res) => {
        this.playtm(res.data.data)
      }
    })
  },
  playtm(yhlist) {
    let x = 110;
    let y = 0;
    let speed = 0.3;
    this.setData({
      tmlist: []
    })
    for (let i = 0; i < yhlist.length; i++) {
      y = Math.floor((Math.random() * this.data.imgHeight) + 100);
      this.data.tmlist.push({
        avatarUrl: yhlist[i].avatarUrl,
        xinmin: yhlist[i].xinmin,
        x: x,
        y: y
      })
      this.setData({
        tmlist: this.data.tmlist
      })
    }
    // let timer = setInterval(() => {
    //   for (let i = 0; i < this.data.tmlist.length; i++) {
    //     this.data.tmlist[i].x = (this.data.tmlist[i].x - speed) < -100 ? 110 : this.data.tmlist[i].x - speed
    //     this.setData({
    //       tmlist: this.data.tmlist
    //     })
    //   }
    // }, 20);
    // this.setData({
    //   tmtimer: timer
    // })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(this.data.timer)
    clearInterval(this.data.tmtimer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(this.data.timer);
    clearInterval(this.data.tmtimer)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },
  rbuy(e) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../../pages/login/login',
            })
          }, 1000)
        }
      })
      return;
    }
    let app = getApp();
    app.globalData.tc = this.data.item;
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
            url: '../../pages/jiesuan/jiesuan',
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
      path: '/subpackages/pintuanPro/pintuanPro?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  },
  onShareTimeline(e) {
    return {
      title: "您的好友给您分享了一个产品",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/subpackages/pintuanPro/pintuanPro?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  }
})