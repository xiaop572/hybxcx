// subpackages/miaoshaList/miaoshaList.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: 10,
    proList: [],
    newHours: 0
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
    let date = new Date();
    let nowHours = date.getHours();
    this.setData({
      newHours: nowHours
    })
    if (nowHours == 10 || nowHours == 11 || nowHours == 14 || nowHours == 20 || nowHours == 22) {
      this.setData({
        time: nowHours
      })
    }
    // if(nowHours==11 || nowHours ==12 || nowHours==13){
    //   this.setData({
    //     time:11
    //   })
    // }
    this.getProList();
  },
  changTime(e) {
    this.setData({
      time: e.currentTarget.dataset.time
    }, () => {
      this.getProList()
    })
  },
  getProList() {
    req({
      url: util.baseUrl + "/frontapi/api/ms/getmspage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999,
        time: this.data.time,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        this.setData({
          proList: res.data.data
        })
      }
    })
  },
  rmsPro(e) {
    wx.myNavigateToz({
      url: '../miaoshaPro/miaoshaPro?id=' + e.currentTarget.dataset.id,
    })
  },
  subms(e) {
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
          wx.requestSubscribeMessage({
            tmplIds: ['Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU'],
            success: res => {
              req({
                url: util.baseUrl + "/frontapi/api/subt/submiaosha",
                method: "POST",
                data: {
                  openid: wx.getStorageSync('openid'),
                  templateid: "Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU",
                  proid: e.currentTarget.dataset.id
                },
                success: (res) => {
                  if (res.data.status) {
                    wx.showToast({
                      title: res.data.data
                    })
                    this.getProList()
                  } else {
                    wx.showToast({
                      title: res.data.data
                    })
                  }
                }
              })
            }
          })
        }
      })
    }

  },
  cansubms(e) {
    req({
      url: util.baseUrl + "/frontapi/api/subt/cancelsubmiaosha",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        templateid: "Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU",
        proid: e.currentTarget.dataset.id
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: res.data.data
          })
          this.getProList()
        } else {
          wx.showToast({
            title: res.data.data
          })
        }
      }
    })
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