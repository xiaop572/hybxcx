// subpackages/tjdhhome/tjdhhome.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    merchantOrderNo:"",
    isyz:false,
    realname:"",
    tel:"",
    yzm:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  saoyisao() {
    wx.scanCode({
      success: res => {
        if (res.errMsg === 'scanCode:ok') {
          this.setData({
            merchantOrderNo: res.result
          })
          wx.showLoading({
            title: '加载中',
          })
          this.gettjinfo(res.result)
        }
      }
    })
  },
  gettjinfo(code){
    req({
      url:util.baseUrl+"/newapi/api/tjpdf/tjinfo2get",
      method:"post",
      data:{
        openid:wx.getStorageSync('openid'),
        SerialNo:code
      },
      success:res=>{
        wx.hideLoading()
        if(res.data.status){
          let data=res.data.data
          this.setData({
            realname:data.realname,
            sfzh:data.sfzh,
            tel:data.tel
          })
        }
      }
    })
  },
  getcode() {
    if (!this.data.tel) {
      wx.showToast({
        title: '请输入手机号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/tjpdf/sendpapermobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.tel,
        xinmin:this.data.realname,
        serialno:this.data.merchantOrderNo
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            code: res.data.data,
            num: 60
          }, () => {
            this.countTime()
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showModal:false,
            complete: (res) => {
          
              if (res.confirm) {
                
              }
            }
          })
        }
      }
    })
  },
  next(){
    if(!this.data.tel){
      wx.showToast({
        title: '请扫描体检号',
      })
      return;
    }
    if(!this.data.yzm){
      wx.showToast({
        title: '请填写验证码',
      })
      return;
    }
    req({
      url:util.baseUrl+"/newapi/api/tjpdf/checkwlmobile",
      method:"POST",
      data:{
        openid:wx.getStorageSync('openid'),
        mobile:this.data.tel,
        xinmim:this.data.realname,
        checkcode:this.data.yzm
      },
      success:res=>{
        console.log(res)
        if(res.data.status){
          this.setData({
            isyz:true
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false,
           
          })
        }
      }
    })
  },
  noty(){
    this.setData({
      isyz:false
    })
    this.zhongzhi()
  },
  zhongzhi(){
    this.setData({
      merchantOrderNo:"",
      realname:"",
      tel:"",
      num:0,
      yzm:""
    })
  },
  ty(){
    req({
      url:util.baseUrl+"/newapi/api/tjpdf/bcagree",
      method:"post",
      data:{
        openid:wx.getStorageSync('openid'),
        mobile:this.data.tel,
        xinmin:this.data.realname,
        serialno:this.data.merchantOrderNo
      },
      success:res=>{
        if(res.data.status){
          wx.showModal({
            title: '提示',
            content: '您已成功兑换'+res.data.data+'分',
            showCancel:false,
            complete: (res) => {
              if (res.confirm) {
                wx.redirectTo({
                  url: '../tjdhlist/tjdhlist',
                })
              }
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false
          })
        }
      }
    })
  },
  countTime() {
    console.log(this.data.num)
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