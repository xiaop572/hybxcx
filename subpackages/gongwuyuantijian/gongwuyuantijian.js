// pages/danweitijian/danweitijian.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['已婚', '未婚'],
    sexList: ['男', '女'],
    hunyin: "",
    timeList: [],
    time: "",
    sex: "",
    xinmin: "",
    mobile: "",
    cardno: "",
    corp: "",
    fromsource: "",
    openid: "",
    ptype: 19
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    this.getTime()
    console.log(app)
  },
  getTime() {
    req({
      url: util.baseUrl + "/newapi/api/mindex/tjdate",
      method: "GET",
      data: {
        classid: 1
      },
      success: (res) => {
        this.setData({
          timeList: res.data.data
        })
      }
    })
  },
  bindTimeChange(e) {
    this.setData({
      time: this.data.timeList[e.detail.value]['sdate']
    })
  },
  bindsexchange(e) {
    this.setData({
      sex: this.data.sexList[e.detail.value]
    })
  },
  inputCardno(e){
    if(e.detail.value.length===18){
      req({
        url:util.baseUrl+"/newapi/api/tj/getcorptjstatus",
        method:"POST",
        data:{
          cardno:e.detail.value,
          mobile:""
        },
        success:res=>{
          if(res.data.status){
            this.setData({
              corp:res.data.data.corp
            })
          }else{
            this.setData({
              corp:""
            })
            wx.showModal({
              showCancel:false,
              title:"提示",
              content:"你的信息未登记，请核实再进行预约"
            })
          }
        }
      })
      console.log(e.detail.value)
    }
  },
  bindhunchange(e) {
    this.setData({
      hunyin: this.data.array[e.detail.value]
    })
  },
  rtijiao() {

    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名!',
      })
      return;
    } else if (!this.data.mobile) {
      wx.showToast({
        title: '请填写手机号!',
      })
      return;
    }else if (!this.data.corp) {
      wx.showToast({
        title: '请填写单位!',
      })
      return;
    }else if (!this.data.time) {
      wx.showToast({
        title: '请选择时间!',
      })
      return;
    }
    let params = {
      ptype: 19,
      openid: wx.getStorageSync('openid'),
      mobile: this.data.mobile,
      xinmin: this.data.xinmin,
      sex: "",
      yydate: this.data.time,
      cardno: "",
      marry: "",
      corp: this.data.corp,
      fromsource: wx.getStorageSync('sponsor')
    }
    req({
      url: util.baseUrl + '/newapi/api/tj/gwytj',
      method: "POST",
      data: params,
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          this.setData({
            mobile: "",
            xinmin: "",
            sex: "",
            time: "",
            cardno: "",
            hunyin: "",
            corp: "",
            fromsource: ""
          })
          app.globalData.tjyy={
            id:res.data.otherData,
            unitMoney:res.data.msg,
          }
          if (res.data.methodDescription) {
            wx.navigateTo({
              url: '../selectxiang/selectxiang',
            })
            return;
          }
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel:false
          })
          return;
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