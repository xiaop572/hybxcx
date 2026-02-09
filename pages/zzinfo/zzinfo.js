const {
  req
} = require("../../utils/request")
const util = require('../../utils/util')
// pages/zzinfo/zzinfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    name: "",
    num: "1",
    remark: "",
    phone: "",
    showtime: false,
    rqtime: "",
    curriqi: -1,
    kydatelist: [],
    kytimelist: [],
    showkytime: false,
    da: "",
    yuyuedate: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })
  },
  bindNjTimeChange(e) {
    this.setData({
      rqtime: e.detail.value
    })
  },
  cat() {

  },
  selRiqi(e) {
    let date = new Date()
    this.setData({
      curriqi: e.currentTarget.dataset.index
    }, () => {
      var da = date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + (date.getDate() + e.currentTarget.dataset.item)
      this.setData({
        da: da
      })
      req({
        url: util.baseUrl + '/newapi/api/ky/kydatelist',
        method: "POST",
        data: {
          date: da,
          "check_room": this.data.options.room
        },
        success: (res) => {
          if (res.data.status) {
            this.setData({
              kydatelist: res.data.data,
              showkytime:false
            })
          } else {
            wx.showToast({
              title: res.data.msg,
            })
          }
        }
      })
    })
  },
  gettimelist(e) {
    req({
      url: util.baseUrl + '/newapi/api/ky/kytimelist',
      method: "POST",
      data: {
        id: e.currentTarget.dataset.id
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            kytimelist: res.data.data.list,
            showkytime: true
          })
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  selecttime() {
    this.setData({
      showtime: true
    })
  },
  // rfukuan() {
  //   req({
  //     url: util.baseUrl + "/newapi/api/msg/preyinxiangpay",
  //     method: "POST",
  //     data: {
  //       "summary": this.data.options.summary,
  //       "orderTitle": this.data.options.title,
  //       "buweiNum": Number(this.data.num),
  //       "Memo": this.data.remark,
  //       "OutTradeNo": String(+new Date()),
  //       "TotalFee": Number(this.data.options.TotalFee),
  //       "openId": wx.getStorageSync('openid'),
  //       "xinmin": this.data.name,
  //       "mobile": this.data.phone,
  //       "Source": wx.getStorageSync('sponsor'),
  //       "ptype": 16
  //     },
  //     success: (res) => {
  //       if (res.data.msg === '0元交易成功') {
  //         wx.showToast({
  //           title: '预约成功'
  //         })
  //         setTimeout(() => {
  //           wx.navigateTo({
  //             url: '../jianyankaidan/jianyankaidan',
  //           })
  //         }, 2000);
  //         return;
  //       }
  //       if (res.data.status) {
  //         let data = res.data.data;
  //         wx.navigateTo({
  //           url: '../fukuan/fukuan?appId=' + data.appId + '&nonceStr=' + data.nonceStr + '&package=' + data.package + '&paySign=' + data.paySign + '&paymentId=' + data.paymentId + '&signType=' + data.signType + '&timeStamp=' + data.timeStamp + '&TotalFee=' + Number(this.data.options.TotalFee) + '&prepay_id=' + data.prepay_id,
  //         })
  //       }
  //     }
  //   })
  // },
  rfukuan() {
    if(!this.data.name){
      wx.showToast({
        title: '请填写姓名',
      })
      return;
    }
    if(!this.data.phone){
      wx.showToast({
        title: '请填写手机号',
      })
      return;
    }
    if(!this.data.yuyuedate.id){
      wx.showToast({
        title: '请选择预约时间',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/ky/addpacslv",
      method: "POST",
      data: {
        "summary": this.data.options.summary,
        "orderTitle": this.data.options.title,
        "buweiNum": Number(this.data.num),
        "memo": this.data.remark,
        "OutTradeNo": String(+new Date()),
        "TotalFee": Number(this.data.options.TotalFee),
        "openId": wx.getStorageSync('openid'),
        "xinmin": this.data.name,
        "mobile": this.data.phone,
        "Source": wx.getStorageSync('sponsor'),
        "ptype": 16,
        "check_room": this.data.yuyuedate.room,
        "dep": this.data.yuyuedate.dep,
        "dep_area": this.data.yuyuedate.deparea,
        "modality": this.data.yuyuedate.modality,
        "medcine": this.data.yuyuedate.medcine,
        "pdid": this.data.yuyuedate.id,
        "date":this.data.yuyuedate.date,
        "time":this.data.yuyuedate.item
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功'
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '../jianyankaidan/jianyankaidan',
            })
          }, 2000);
          return;
        }else{
          wx.showModal({
            title: '预约提示',
            content: res.data.msg,
            showCancel:false
          })
        }
        if (res.data.status) {
          let data = res.data.data;
          wx.navigateTo({
            url: '../fukuan/fukuan?appId=' + data.appId + '&nonceStr=' + data.nonceStr + '&package=' + data.package + '&paySign=' + data.paySign + '&paymentId=' + data.paymentId + '&signType=' + data.signType + '&timeStamp=' + data.timeStamp + '&TotalFee=' + Number(this.data.options.TotalFee) + '&prepay_id=' + data.prepay_id,
          })
        }
      }
    })
  },
  closekytime() {
    this.setData({
      showkytime: false
    })
  },
  closetime(){
    this.setData({
      showtime:false,
      showkytime:false
    })
  },
  yuyue(e) {
    this.setData({
      showkytime: false,
      showtime: false,
      yuyuedate: e.currentTarget.dataset
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})