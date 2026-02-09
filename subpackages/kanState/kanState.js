const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
// subpackages/kanState/kanState.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {},
    yikan: 0,
    shengyu: 0,
    yuanjia: 0,
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0,
    endtime: 0,
    helpUserInfo: {},
    helpList: [{
        nickname: "二货"
      },
      {
        nickname: "张三"
      }
    ],
    helpOpenid: "",
    myOpenid: "",
    proid: 0,
    item: {},
    timer: null,
    ishelp: false,
    helpstate: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    if (!options.helpOpenid) {
      wx.showToast({
        title: '没有助力ID',
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    }
    this.setData({
      proid: options.proid,
      helpOpenid: options.helpOpenid,
      myOpenid: wx.getStorageSync('openid')
    }, () => {
      if (wx.getStorageSync('openid') !== options.helpOpenid) {
        that.setData({
          ishelp: true
        })
      }
    })
    this.getproDetails(options);
    this.gethelpuserinfo(options);
    this.setData({
      userinfo: wx.getStorageSync('userInfo')
    })
  },
  directBuy(e) {
    let app = getApp();
    app.globalData.tc = this.data.item;
    app.globalData.tc.price = this.data.item.pointsDeduction;
    wx.myNavigateTo({
      url: '../../pages/jiesuan/jiesuan',
    })
  },
  getproDetails(options) {
    let that = this;
    req({
      url: util.baseUrl + "/newapi/api/kanjia/getusermykj",
      method: "POST",
      data: {
        proid: options.proid,
        curpage: 1,
        openid: this.data.helpOpenid
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            item: res.data.data,
            endtime: new Date(res.data.data.enddate).getTime(),
            yikan: res.data.data.dealmoney,
            shengyu: res.data.data.shengyu,
            yuanjia: res.data.data.pointsDeduction
          })
          if(res.data.data.isdelete!==0){
            wx.showToast({
              title: '该产品已下架',
            })
            setTimeout(()=>{
              wx.switchTab({
                url: '../../pages/index/index',
              })
            },1000)
          }
          if (new Date(res.data.data.enddate).getTime() < new Date().getTime()) {
            wx.showToast({
              title: '该活动已结束',
            })
            setTimeout(() => {
              wx.switchTab({
                url: '../../pages/qiandaoHome/qiandaoHome',
              })
            }, 2000)
            return;
          }
          this.getkjhelp(options); //获取助力人员
          this.checkhelpkj(options); //获取助力状态
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
        } else {
          wx.showToast({
            title: '网络出错',
          })
        }
      }
    })
  },
  getkjhelp(options) {
    req({
      url: util.baseUrl + "/newapi/api/kanjia/getkjhelp",
      method: "POST",
      data: {
        openid: this.data.helpOpenid,
        proid: parseInt(options.proid),
        barid: this.data.item.barid
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            helpList: res.data.data
          })
        }
      }
    })
  },
  gethelpuserinfo(options) {
    req({
      url: util.baseUrl + "/newapi/api/kanjia/getsnsinfo",
      method: "POST",
      data: {
        openid: options.helpOpenid
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            helpUserInfo: res.data.data
          })
        }
      }
    })
  },
  checkhelpkj(options) {
    req({
      url: util.baseUrl + "/newapi/api/kanjia/checkhelpkj",
      method: "POST",
      data: {
        barid: this.data.item.barid,
        helpopenid: wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          helpstate: res.data.status
        })
      }
    })
  },
  kjshop() {
    let app = getApp();
    app.globalData.tc = this.data.item;
    wx.myNavigateTo({
      url: '../../pages/jiesuan/jiesuan',
    })
  },
  helpKanjia() {
    if (!wx.getStorageSync('userInfo')) {
      wx.showToast({
        title: '请登录',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '../../pages/login/login',
        })
      }, 2000)
    } else {
      req({
        url: util.baseUrl + "/newapi/api/kanjia/savehelpkj",
        method: "POST",
        data: {
          barid: this.data.item.barid,
          helpopenid: wx.getStorageSync('openid')
        },
        success: res => {
          if (res.data.status) {
            wx.showToast({
              title: '助力成功',
            })
            this.setData({
              helpstate: true
            })
          }
        }
      })
    }

  },
  starthelpme() {
    wx.redirectTo({
      url: '../../subpackages/kanState/kanState?proid=' + this.data.proid + '&helpOpenid=' + wx.getStorageSync('openid'),
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我想要' + this.data.item.price + '元拿走【慧医宝超级特权月】……，帮我砍一刀……',
      imageUrl: 'https://wx.pmc-wz.com/hyb/images/' + this.data.item.picurl,
      query: 'proid=' + this.data.proid + '&helpOpenid=' + this.data.helpOpenid
    }
  }
})