// pages/yzcfk/yzcfk.js
const {
  req
} = require("../../utils/request")
const util = require('../../utils/util')
let timer = null;
let gd = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0,
    hang: 7,
    curindex: 0,
    transtate: true,
    cgshow: false,
    item: {},
    xinmin: "",
    mobile: "",
    summary: "",
    list:[],
    cfinfo:{}
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
    req({
      url: util.baseUrl + "/frontapi/api/pack/getonepack",
      method: "GET",
      data: {
        id: 1849
      },
      success: res => {
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data
        })
      }
    })
  },
  tj() {
    let that = this;
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名',
      })
      return;
    } else if (this.data.mobile.length !== 11) {
      wx.showToast({
        title: '请填写联系方式',
      })
      return;
    } else if (!this.data.summary) {
      wx.showToast({
        title: '请填写预产期',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/park/prepackpaynum",
      method: "POST",
      data: {
        "summary": that.data.summary,
        "orderTitle": that.data.item.pictitle,
        "OutTradeNo": String(+new Date()),
        "TotalFee": that.data.item.price,
        "openId": wx.getStorageSync('openid'),
        "xinmin": that.data.xinmin,
        "mobile": that.data.mobile,
        "Source": wx.getStorageSync('sponsor'),
        "ptype": 18,
        "proid": 1849,
        "spes": that.data.item.selSpec,
        num: 1
      },
      success: (res) => {
        if (!res.data.status) {
          wx.hideLoading({})
          wx.showModal({
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        wx.hideLoading({})
        wx.requestPayment({
          ...res.data.data,
          success: (ress) => {
            if (ress.errMsg === "requestPayment:ok") {
              wx.showToast({
                title: '报名成功'
              })
              this.setData({
                cgshow:false
              })
            }
          },
          fail(res) {

          }
        })

      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  showcg() {
    this.setData({
      cgshow: true
    })
  },
  guanbi() {
    this.setData({
      cgshow: false
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getdm()
    this.getcfkinfo()
    timer = setInterval(() => {
      let result = this.intervalTime(
        new Date().getTime(),
        new Date("2024-11-11").getTime()
      );
      this.setData({
        day: result[0],
        hour: result[1],
        minute: result[2],
        seconds: result[3]
      })
    }, 1000)
    gd = setInterval(() => {
      if (this.data.curindex >= this.data.hang) {
        this.setData({
          transtate: false,
          curindex: 0
        })
      } else {
        this.setData({
          transtate: true,
          curindex: this.data.curindex + 1
        })
      }
    }, 3000)
  },
  getdm(){
    req({
      url:util.baseUrl+"/newapi/api/yuezi/getcfkdanmu",
      method:"GET",
      data:{
        num:35
      },
      success:res=>{
        this.setData({
          list:res.data.data
        })
      }
    })
  },
  getcfkinfo(){
    req({
      url:util.baseUrl+"/newapi/api/yuezi/getcfkinfo",
      method:"GET",
      data:{
        num:0
      },
      success:res=>{
        this.setData({
          cfinfo:res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(timer)
    clearInterval(gd)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  intervalTime(startTime, endTime) {
    // var timestamp=new Date().getTime(); //计算当前时间戳
    var timestamp = Date.parse(new Date()) / 1000; //计算当前时间戳 (毫秒级)
    var date1 = ""; //开始时间
    if (timestamp < startTime) {
      date1 = startTime;
    } else {
      date1 = timestamp; //开始时间
    }
    var date2 = endTime; //结束时间
    // var date3 = date2.getTime() - date1.getTime(); //时间差的毫秒数
    var date3 = date2 - date1; //时间差的毫秒数

    if (date3 < 0) {
      return false;
    }
    //计算出相差天数
    var days = Math.floor(date3 / (24 * 3600 * 1000));
    //计算出小时数

    var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000));

    //计算相差秒数

    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000);
    return [days, hours, minutes, seconds];
    //return   days + "天 " + hours + "小时 "
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
      title: "和平国际月子中心【年终感恩狂欢季】199元宠粉卡惊喜上线，福利满满！",
      imageUrl: "https://wx.pmc-wz.com/materials/cfkfx.jpg",
      path: '/pages/yzcfk/yzcfk?fromid=' + wx.getStorageSync('openid')
    }
  },
  onShareTimeline(){
    return {
      title: "和平国际月子中心【年终感恩狂欢季】199元宠粉卡惊喜上线，福利满满！",
      imageUrl: "https://wx.pmc-wz.com/materials/cfkfx.jpg",
      path: '/pages/yzcfk/yzcfk?fromid=' + wx.getStorageSync('openid')
    }
  },
})