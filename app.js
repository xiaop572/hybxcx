// app.js 1111
const util = require('./utils/util');
const {
  req
} = require("./utils/request");
! function () {
  var PageTmp = Page;
  Page = function (pageConfig) {
    // 设置全局默认分享
    pageConfig = Object.assign({
      onShareAppMessage: function () {
        return {
          title: "慧医宝",
          path: '/pages/index/index?fromid=' + wx.getStorageSync('openid')
        };
      }
    }, pageConfig);
    PageTmp(pageConfig);
  };
}();

App({
  onLaunch(options) {
    wx.cloud.init({
      env: "cloud1-0ghzwmvh6f1ef56d",
    });
    util.init() //初始化实用工具
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []

    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }

    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.login({
      success: res => {
        wx.setStorageSync('loginCode', res.code)
        wx.request({
          url: util.baseUrl + '/newapi/api/WechatUser/getopenid',
          data: {
            id: res.code
          },
          success: res => {
            if(res.data.data){
              wx.setStorageSync('openid', res.data.data);
            }
            console.log(wx.getStorageSync('userInfo'))
            if (wx.getStorageSync('userInfo')) {
              wx.request({
                url: util.baseUrl + "/newapi/api/WechatUser/getqrinfo",
                data: {
                  openid: wx.getStorageSync('openid')
                },
                success: reso => {
                  if (reso.data.data) {
                    wx.setStorageSync('qrinfo', reso.data.data)
                  }
                }
              })
            }
            wx.setStorageSync('sessionKey', res.data.msg)
          }
        })
      }
    })

    wx.onAppRoute((res) => {

      let openid = wx.getStorageSync('openid');
      if (!openid) {
        wx.login({
          success: res => {
            wx.request({
              url: util.baseUrl + '/aiapi/api/WechatUser/getopenid',
              data: {
                id: res.code
              },
              success: res => {
                if(res.data.data){
                  wx.setStorageSync('openid', res.data.data);
                }
                console.log(res.data.data, "openid")
                req({
                  url: util.baseUrl + "/newapi/api/hd/jlpageview",
                  method: "POST",
                  data: {
                    shareopenid: wx.getStorageSync('sponsor'),
                    useropenid: wx.getStorageSync('openid'),
                    pageurl: res.path,
                    query: JSON.stringify(res.query)
                  }
                })
              }
            })
          }
        })
      } else {
        req({
          url: util.baseUrl + "/newapi/api/hd/jlpageview",
          method: "POST",
          data: {
            shareopenid: wx.getStorageSync('sponsor'),
            useropenid: wx.getStorageSync('openid'),
            pageurl: res.path,
            query: JSON.stringify(res.query)
          }
        })
      }
    })

  },
  globalData: {
    userInfo: null,
    tjyy: {}, //体检预约套餐存储对象
    searchList: [], //搜索结果
    searchKey: "",
    tuiItem: {},
    yxpat_id: "",
    jumpurl: "",
    pttc: {},
    tjtjxm: []
  }
})