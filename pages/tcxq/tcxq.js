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
    imgHeight: 400, // 设置初始高度，防止轮播图不显示
    options: {},
    specVis: false,
    spec: "",
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0,
    endtime: 0,
    timer:null,
    showModal: false
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
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id = arr[1]
    }
    if (options.sponsor) {
      wx.setStorageSync('sponsor', options.sponsor)
    }

    req({
      url: util.baseUrl + "/frontapi/api/pack/getonepack",
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
              url: '../index/index',
            })
          }, 1000)
        }
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data
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
        console.log("https://wx.pmc-wz.com/hyb/images/" + res.data.data.picurl)
        wx.getImageInfo({
          src: "https://wx.pmc-wz.com/hyb/images/" + res.data.data.picurl,
          success: ress => {
            // 使用 wx.getWindowInfo 替代已废弃的 wx.getSystemInfo
            wx.getSystemInfo({
              success: (result) => {
                let scrHeight = result.windowWidth / ress.width * ress.height
                this.setData({
                  imgHeight: scrHeight
                })
              },
            })

          },
          fail: (error) => {
            console.error('获取图片信息失败:', error);
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
  cancelSec() {
    this.setData({
      specVis: false
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
    let that=this;
    this.data.timer = setInterval(() => {
      let timeArr = util.intervalTime(new Date().getTime(), new Date('2023/8/15'));
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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(this.data.timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(this.data.timer)
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
              url: '../login/login',
            })
          }, 1000)
        }
      })
      return;
    }
    let realinfo=wx.getStorageSync('realInfo');
    if(!realinfo.mobile || !realinfo.realname){
      wx.showToast({
        title: '请先实名认证',
      })
      setTimeout(()=>{
        wx.navigateTo({
          url: '../realInfo/readlInfo',
        })
      },2000)
      return;
    }
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
    let realinfo=wx.getStorageSync('realInfo');
    if(!realinfo.mobile || !realinfo.realname){
      wx.showToast({
        title: '请先实名认证',
      })
      setTimeout(()=>{
        wx.navigateTo({
          url: '../realInfo/readlInfo',
        })
      },2000)
      return;
    }
    this.prepaygoods()
  },
  prepaygoods() {
    let app = getApp();
    app.globalData.tc = this.data.item;
    app.globalData.tc.selSpec = this.data.spec;
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
  },

  // 显示预约金说明弹框
  showDepositInfo() {
    this.setData({
      showModal: true
    });
  },

  // 隐藏预约金说明弹框
  hideDepositInfo() {
    this.setData({
      showModal: false
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})