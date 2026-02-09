// pages/my/my.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: ""
    },
    realInfo: {

    },
    myopenid: "",
    qrinfo: {},
    memberstate: 0,
    iskefu: false,
    kefuList: [
      "oEJsU5K9tvGA3XsqjEjrseYDmsXo", "oEJsU5LvZrKoKFJ5UOh-tv4sGVeI", "oEJsU5Ly9t2Efbn3yfxSzc3gVRqA",
      "oEJsU5A5FcwTjU8odFHkPYcMCKC4", "oEJsU5NzpuY-Qy1WQ0w7ywze5Gd8", "oEJsU5Jt9nFpjmy8hTS9-rNzUa0Q",
      "oEJsU5ACtTCmz_dRnqrZYEggW4ds", "oEJsU5G_8zaf8LgCrylGukHUsihI", "oEJsU5D4Xll8VsokOLQIFUJpeo8o",
      "oEJsU5AfECXleird7GAXTtE4WRS0", "oEJsU5ELzNQjS3m2w7lup1Wwv84w", "oEJsU5D5fQLKl2mc2-Y63tHAVHQA",
      "oEJsU5NePyYXcLQa2L4wtcwwgfes", "oEJsU5EjxkAT9TWbpX7_ZsPBPUlY"

    ],
    alljf: 0,
    kanum: 0,
    coupon:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.kefuList.forEach(item => {
      if (item === wx.getStorageSync('openid')) {
        this.setData({
          iskefu: true
        })
      }
    })
  },

  rzuji(){
    wx.navigateTo({
      url: '../../subpackages/zuji/zuji',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  rsph() {
    wx.navigateTo({
      url: '../../subpackages/sfyjiaofei/sfyjiaofei',
    })
  },
  rylfw() {
    // wx.switchTab({
    //   url: '../yiliaofuwu/yiliaofuwu',
    // })
    wx.navigateTo({
      url: '../yiliaofuwu/yiliaofuwu',
    })
  },
  rcflist() {
    wx.myNavigateTo({
      url: "../../subpackages/cflist/cflist"
    })
  },
  rbangka() {

    wx.myNavigateTo({
      url: "../../subpackages/mybangka/mybangka"
    })
  },
  rjianyan() {
    wx.myNavigateTo({
      url: "../../subpackages/jianyanList/jianyanList"
    })
  },
  rtjpdf() {
    wx.myNavigateTo({
      url: "../../subpackages/tjpdf/tjpdf"
    })
  },
  rqy() {
    wx.myRedirectTo({
      url: "../../subpackages/qiyezhuce/qiyezhuce"
    })
  },
  rygtgm() {
    wx.myNavigateTo({
      url: "../../subpackages/ygtuiguangma/ygtuiguangma"
    })
  },
  ryxList() {
    wx.myNavigateTo({
      url: "../../subpackages/yxList/yxList"
    })
  },
  rtest() {
    wx.myNavigateTo({
      url: '../test/test'
    })
  },
  rmycard() {
    wx.myNavigateTo({
      url: "../../subpackages/mycard/mycard?index=0"
    })
  },
  rmyyhq(){
    wx.myNavigateTo({
      url: "/subpackagesC/yhq/yhq?index=0"
    })
  },
  rjifen() {
    wx.myNavigateTo({
      url: "../../subpackages/jifenzhongxin/jifenzhongxin"
    })
  },
  rzaoanlist() {
    wx.myNavigateTo({
      url: "../zaoanList/zaoanList"
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
                req({
                  url: util.baseUrl + "/newapi/api/subt/usersubt",
                  method: "POST",
                  data: {
                    templateid: "Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU",
                    openid: wx.getStorageSync('openid')
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
  rzt() {
    wx.navigateTo({
      url: '../nzkh/nzkh',
    })
  },
  rmytcq() {
    wx.myNavigateTo({
      url: "../../subpackages/tcbag/tcbag"
    })
  },
  rxinxuan() {
    wx.myNavigateTo({
      url: "../../subpackages/xinxuan/xinxuan"
    })
  },
  rtcxq() {
    wx.navigateTo({
      url: '../tcxq/tcxq',
    })
  },
  rCallList() {
    wx.myNavigateTo({
      url: '../callList/callList'
    })
  },
  rluyin() {
    wx.myNavigateTo({
      url: '../luyin/luyin'
    })
  },
  rshangcheng() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
      path: '/pages/goods/goods?id=433'
    })
  },
  rPro() {
    wx.myNavigateTo({
      url: '../pro/pro',
    })
  },
  rTest() {
    wx.myNavigateTo({
      url: '../yinpin/yinpin',
    })
  },
  rorder() {
    wx.myNavigateTo({
      url: "../order/order"
    })
  },
  rReport: function () {
    wx.myNavigateTo({
      url: '../report/report',
    })
  },
  rMyYy: function () {
    wx.myNavigateTo({
      url: '../yuyue/yuyue',
    })
  },
  rding: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['KRIQOSbcjvDd7m2t6B-TgmqZ38sFzQRrc0P1hH4NmkE', 'XV38p-ZFA-9hEEfTHmZ9TtdcUrRhYsAFu6zFzvMsgGM'],
      success: ress => {
        console.log(ress)
      }
    })
  },
  rKefu: function () {
    wx.navigateTo({
      url: '../kefu/kefu',
    })
  },
  rOrder: function () {
    wx.myNavigateTo({
      url: '../order/order',
    })
  },
  rshoukuan: function () {
    wx.myNavigateTo({
      url: '../shoukuan/shoukuan',
    })
  },
  rsaoyisao: function () {
    wx.navigateTo({
      url: '../facility/facility?code=8500084202'
    })
  },
  rkaquan(e) {
    wx.myNavigateTo({
      url: "../kaquan/kaquan?index=" + e.currentTarget.dataset.index
    })
  },
  rmrqd() {
    wx.myNavigateTo({
      url: "../../subpackages/qiandao/qiandao"
    })
  },
  rqrcode() {
    wx.myNavigateTo({
      url: "../qrcode/qrcode"
    })
  },
  raddvip() {
    wx.myNavigateTo({
      url: "../addVip/addVip"
    })
  },
  rzaoan() {
    wx.myNavigateTo({
      url: '../zaoan/zaoan',
    })
  },
  ryxcode() {
    wx.navigateTo({
      url: '../yxqrcode/yxqrcode',
    })
  },
  getuserjifen() {
    req({
      url: util.baseUrl + "/newapi/api/jifen/getuserjifen",
      method: "POST",
      data: {
        "openid": wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          alljf: res.data.data.alljf
        })
      }
    })
  },
  usercouponcount() {
    req({
      url: util.baseUrl + "/newapi/api/coupon/usercouponcount",
      method: "POST",
      data: {
        "openid": wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          coupon: res.data.data.count
        })
      }
    })
  },
  getpackfreenum() {
    req({
      url: util.baseUrl + "/newapi/api/pack/getpackfreenum",
      method: "POST",
      data: {
        "openid": wx.getStorageSync('openid'),
        "curpage": 1,
        "limit": 99999
      },
      success: res => {
        this.setData({
          kanum: res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
    this.getuserjifen();
    this.getpackfreenum();
    this.usercouponcount();
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
    this.setData({
      realInfo: wx.getStorageSync('realInfo'),
      myopenid: wx.getStorageSync('openid'),
      qrinfo: wx.getStorageSync('qrinfo')
    })
    if (wx.getStorageSync('isLogin')) {
      req({
        url: util.baseUrl + "/newapi/api/member/getusermember",
        method: "POST",
        data: {
          openid: wx.getStorageSync('openid')
        },
        success: res => {
          this.setData({
            memberstate: Number(res.data.msg)
          })
        }
      })
    }
    
  },
  rTian() {
    wx.myNavigateTo({
      url: '../realInfo/readlInfo'
    })
  },
  routeMyInfo() {
    if (wx.getStorageSync('userInfo')) {
      wx.navigateTo({
        url: '../myInfo/myInfo',
      })
    } else {
      wx.navigateTo({
        url: '../login/login',
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  saoyisao() {
    wx.scanCode({
      success: res => {
        if (res.errMsg === 'scanCode:ok') {
          wx.redirectTo({
            url: '../facility/facility?code=' + res.result,
          })
        }
      }
    })
  },
  rmybka() {
    app.globalData.jumpurl = "../../subpackages/mybangka/mybangka"
    wx.myNavigateTo({
      url: '../../subpackages/mybangka/mybangka',
    })
  },
  rzyjc() {
    wx.myNavigateTo({
      url: '../../subpackages/zyjchome/zyjchome'
    })
  },
  getqrinfo() {
    req({
      url: util.baseUrl + "/newapi/api/WechatUser/getqrinfo",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {

      }
    })
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }

})