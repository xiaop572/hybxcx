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
    hour: "",
    minute: "",
    seconds: "",
    timer: null,
    msvis: true
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
    }
    req({
      url: util.baseUrl + "/frontapi/api/ms/getonemiaosha",
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
          item: res.data.data
        }, () => {
          const begindate = this.data.item.begindate;
          console.log(begindate,"123123")
          if (!begindate) {
            console.log("e ")
            this.setData({
              msvis: false
            });
            return;
          }
          console.log(begindate,"fdsafdsf")
          const itemDate = new Date(begindate);
          const today = new Date();
          const isToday = itemDate.getFullYear() === today.getFullYear() &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getDate() === today.getDate();
          
            console.log(isToday,"??")
          if (!isToday) {
            this.setData({
              msvis: false
            });
            return;
          }

          const qrwidth = parseInt(this.data.item.qrwidth, 10);
          const currentHour = today.getHours();
          if (!isNaN(qrwidth) && qrwidth <= currentHour) {
            this.setData({
              msvis: true
            });
          } else {
            this.setData({
              msvis: false
            });
          }
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
            console.log("fsdf")
            console.log(ress,"Fdasf")
            wx.getSystemInfo({
              success: (result) => {
                let scrHeight = result.windowWidth / ress.width * ress.height;
                this.setData({
                  imgHeight: scrHeight
                })
              },
            })

          },
          fail(e){
            console.log(e)
          }
        })
      }
    })
  },
  getdaojishi() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Midnight at the end of the current day

    const diff = midnight.getTime() - now.getTime();

    if (diff <= 0) {
      this.setData({
        hour: '00',
        minute: '00',
        seconds: '00'
      });
      clearInterval(this.data.timer);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.setData({
      hour: hours < 10 ? '0' + hours : hours,
      minute: minutes < 10 ? '0' + minutes : minutes,
      seconds: seconds < 10 ? '0' + seconds : seconds
    });
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

    //倒计时
    this.data.timer = setInterval(() => {
      this.getdaojishi()
    }, 1000);
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },
  rbuy(e) {
    if (this.data.item.kc - this.data.item.sanum <= 0) {
      wx.showToast({
        title: '已售罄',
        icon: 'none'
      });
      return;
    }
    let app = getApp();
    let realinfo = wx.getStorageSync('realInfo');
    app.globalData.tc = this.data.item;
    let date = new Date();
    let hours = date.getHours();
    if (!this.data.msvis) {
      wx.showToast({
        title: '秒杀活动尚未开始',
        icon: 'none'
      });
      return;
    }
    // if (!realinfo.mobile || !realinfo.realname) {
    //   wx.showToast({
    //     title: '请先实名认证',
    //   })
    //   setTimeout(() => {
    //     wx.navigateTo({
    //       url: '../../pages/realInfo/readlInfo',
    //     })
    //   }, 2000)
    //   return;
    // }
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
      path: '/subpackages/miaoshaPro/miaoshaPro?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  },
  onShareTimeline(e) {
    return {
      title: "您的好友给您分享了一个产品",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/subpackages/miaoshaPro/miaoshaPro?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  }
})