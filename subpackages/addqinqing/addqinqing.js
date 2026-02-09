// subpackages/addjzka/addjzka.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    phone: "",
    sfzh:"",
    code: "",
    num: 0,
    checkcode: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  next() {
    if(!this.data.name || !this.data.sfzh || !this.data.phone || !this.data.checkcode){
      wx.showToast({
        title: '请填写信息',
      })
      return;
    }
    if(this.data.sfzh.length!==18){
      wx.showToast({
        title: '身份证为18位数',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/yyda/checkyymobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.phone,
        checkcode: this.data.checkcode,
      },
      success: (res) => {
        if (res.data.status) {
          this.bindyyinfo()
        }else{
          wx.showToast({
            title: '验证失败',
          })
        }
      }
    })

  },
  bindyyinfo(){
    req({
      url:util.baseUrl+"/newapi/api/yyda/bindyyinfo",
      method:"POST",
      data:{
        openid:wx.getStorageSync('openid'),
        brxm:this.data.name,
        yddh:this.data.phone,
        sfzh:this.data.sfzh
      },
      success:res=>{
        if(res.data.status){
          wx.showToast({
            title: '保存成功',
          })
          setTimeout(() => {
           wx.navigateBack(-2)
          }, 1500);
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
  getcode() {
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/yyda/sendyymobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
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