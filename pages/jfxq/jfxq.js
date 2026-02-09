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
    memberstate:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that=this;
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    this.setData({
      memberstate:wx.getStorageSync('memberstate')
    })
    req({
      url: util.baseUrl + "/newapi/api/jifen/getonejifen",
      method: "GET",
      data: {
        id: options.id
      },
      success: res => {
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data
        })
        wxParse.wxParse('courseDetail', 'html', res.data.data.detail, that, 5)
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
  rbuy(e) {
    // if(this.data.memberstate==2){
    //   wx.showToast({
    //     title: '会员审核中',
    //   })
    //   return;
    // }
    // if(this.data.memberstate==1){
    //   wx.showToast({
    //     title: '您还未注册会员',
    //   })
    //   setTimeout(() => {
    //     wx.navigateTo({
    //       url: '../addVip/addVip',
    //     })
    //   }, 2000);
    //   return;
    // }
    
    let app = getApp();
    app.globalData.tc=this.data.item;
    wx.myNavigateTo({
      url: '../jfjiesuan/jfjiesuan',
    })
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