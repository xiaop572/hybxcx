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
    remark: "",
    phone: "",
    projectList: ["口腔", "医美", "影像", "胃肠镜", "门诊"],
    projectIndex: -1,
    appointDate: "",
    today: "",
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
    if (options.source) {
      wx.setStorageSync('source', options.source)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    this.setData({
      options: options,
      today: this.formatDate(new Date())
    })
  },
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  onProjectChange(e) {
    this.setData({
      projectIndex: Number(e.detail.value)
    })
  },
  onDateChange(e) {
    this.setData({
      appointDate: e.detail.value
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
    if(this.data.projectIndex === -1){
      wx.showToast({
        title: '请选择项目',
      })
      return;
    }
    if(!this.data.appointDate){
      wx.showToast({
        title: '请选择预约日期',
      })
      return;
    }
    const projectName = this.data.projectList[this.data.projectIndex]
    const userInfo = wx.getStorageSync('userInfo') || {}
    const qrinfo = wx.getStorageSync('qrinfo') || {}
    const nickname = userInfo.nickName || qrinfo.nickname || '微信用户'
    const source = wx.getStorageSync('source') || wx.getStorageSync('sponsor') || ''
    req({
      url: util.baseUrl + "/newapi/api/qd/guoshousend",
      method: "POST",
      data: {
        "openid": wx.getStorageSync('openid'),
        "mobile": this.data.phone,
        "xinmin": this.data.name,
        "nickname": nickname,
        "project": projectName,
        "yydate": this.data.appointDate,
        "source": source,
        "memo": this.data.remark || ''
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功'
          })
          this.setData({
            name: "",
            phone: "",
            projectIndex: -1,
            appointDate: "",
            remark: ""
          })
          return;
        }else{
          wx.showModal({
            title: '预约提示',
            content: res.data.msg,
            showCancel:false
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
