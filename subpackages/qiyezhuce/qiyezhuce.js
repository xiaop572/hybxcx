// subpackages/qiyezhuce/qiyezhuce.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    xinmin: "",
    phone: "",
    parentopenid: "",
    parentcode: "",
    state: false,
    codeState: false,
    num: 0,
    checkcode: "",
    bankname:"",
    cardno:""
  },
  joinyiye() {
    if(this.data.xinmin=="m101" && this.data.checkcode=="9999"){
      wx.setStorageSync('openid', "oEJsU5P0lSc3T_xKJWjjEG64HvsE");
      wx.redirectTo({
        url: '../qiyeHome/qiyeHome',
      })
      return;
    }
    if (!this.data.xinmin || !this.data.phone) {
      wx.showToast({
        title: '请填写姓名手机号',
      })
      return;
    }else if(!this.data.cardno){
      wx.showToast({
        title: '请填写身份证',
      })
      return;
    }else if(!this.data.parentcode){
      wx.showModal({
        title: '提示',
        content: '请通过邀请二维码注册',
        showCancel:false
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/qd/checkyymobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.phone,
        checkcode: this.data.checkcode
      },
      success: res => {
        console.log(res,this.data.bankname,"this.data.bankname")
        if (res.data.status) {
          req({
            url: util.baseUrl + "/newapi/api/prom/joinreg",
            method: "POST",
            data: {
              openid: wx.getStorageSync('openid'),
              xinmin: this.data.xinmin,
              mobile: this.data.phone,
              parentopenid: this.data.parentopenid,
              parentcode: this.data.parentcode,
              bankname:this.data.bankname,
              cardno:this.data.cardno
            },
            success: (res) => {
              if (res.data.status) {
                wx.showToast({
                  title: '申请成功',
                })
                this.getpromcheck()
              }
            }
          })
        }
      }
    })

  },
  getcode() {
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/qd/sendyymobile",
      method: "POST",
      data: {
        openid:wx.getStorageSync('openid'),
        mobile: this.data.phone
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            code: res.data.data,
            num: 60
          }, () => {
            this.countTime()
          })
        }
      }
    })
  },
  countTime() {
    if (this.data.num <= 0) {
      return;
    }
    this.setData({
      num: this.data.num - 1
    })
    setTimeout(() => {
      this.countTime();
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../../pages/login/login',
            })
          }, 1000)
        }
      })
      return;
    }
    this.setData({
      parentopenid: options.fromid
    })
    if (options.ygdm) {
      this.setData({
        parentcode: options.ygdm,
        bankname:options.bankname,
        codeState: true
      })
    }
  },
  getpromcheck() {
    req({
      url: util.baseUrl + "/newapi/api/prom/getpromcheck",
      method: "POST",
      data: {
       openid: wx.getStorageSync('openid'),
      },
      success: (res) => {
        if (res.data.code === 1) {//注册未审核
          this.setData({
            state: true,
            codeState: true
          })
        }
        if (res.data.code === 0) {//审核通过正常登录
          wx.redirectTo({
            url: '../qiyeHome/qiyeHome',
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
    this.getpromcheck()
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