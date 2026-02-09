// huodongPage/jiankangjie/jiankangjie.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zxList: [],
    ckList: [],
    tjList: [],
    kqList: [],
    kflist: []
  },
  rtcxq(e) {
    wx.navigateTo({
      url: "../../subpackages/miaoshaPro/miaoshaPro?id=" + e.currentTarget.dataset.id
    })
  },
  getkqcard() {
    req({
      url: util.baseUrl + "/newapi/api/feme/givevoucherkou",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showModal({
            title: '领取成功',
            content: res.data.data,
            showCancel:false
          })
        } else {
          wx.showToast({
            title: '此券已领取',
          })
        }
      }
    })
  },
  getzxcard() {
    req({
      url: util.baseUrl + "/newapi/api/feme/givevoucherzheng",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showModal({
            title: '领取成功',
            content: res.data.data,
            showCancel:false
          })
        } else {
          wx.showToast({
            title: '此券已领取',
          })
        }
      }
    })

  },
  getckcard() {
    req({
      url: util.baseUrl + "/newapi/api/feme/givevoucherchan",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showModal({
            title: '领取成功',
            content: res.data.data,
            showCancel:false
          })
        } else {
          wx.showToast({
            title: '此券已领取',
          })
        }
      }
    })

  },
  getyzcard() {
    req({
      url: util.baseUrl + "/newapi/api/feme/givevoucheryue",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showModal({
            title: '领取成功',
            content: res.data.data,
            showCancel:false
          })
        } else {
          wx.showToast({
            title: '此券已领取',
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    this.getzxList()
    this.getckList();
    this.gettjList();
    this.getkqList();
    this.getkfList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getzxList() {
    req({
      url: util.baseUrl + "/frontapi/api/ms/getmspage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999,
        time: 0,
        openid: wx.getStorageSync('openid'),
        typeid:1
      },
      success: (res) => {
        this.setData({
          zxList: res.data.data
        })
      }
    })
  },
  getckList() {
    req({
      url: util.baseUrl + "/frontapi/api/ms/getmspage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999,
        time: 0,
        openid: wx.getStorageSync('openid'),
        typeid:4
      },
      success: (res) => {
        this.setData({
          ckList: res.data.data
        })
      }
    })
  },
  gettjList() {
    req({
      url: util.baseUrl + "/frontapi/api/ms/getmspage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999,
        time: 0,
        openid: wx.getStorageSync('openid'),
        typeid:2
      },
      success: (res) => {
        this.setData({
          tjList: res.data.data
        })
      }
    })
  },
  getkqList() {
    req({
      url: util.baseUrl + "/frontapi/api/ms/getmspage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999,
        time: 0,
        openid: wx.getStorageSync('openid'),
        typeid:3
      },
      success: (res) => {
        this.setData({
          kqList: res.data.data
        })
      }
    })
  },
  getkfList() {
    req({
      url: util.baseUrl + "/frontapi/api/ms/getmspage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999,
        time: 0,
        openid: wx.getStorageSync('openid'),
        typeid:6
      },
      success: (res) => {
        this.setData({
          kflist: res.data.data
        })
      }
    })
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
    return {
      title: "和平国际第二届女性健康节限时特惠进行中",
      imageUrl: "https://wx.pmc-wz.com/materials/rlnszf.jpg",
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline() {
    return {
      title: "和平国际第二届女性健康节限时特惠进行中",
      imageUrl: "https://wx.pmc-wz.com/materials/rlnszf.jpg",
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid'),
    }
  },
})