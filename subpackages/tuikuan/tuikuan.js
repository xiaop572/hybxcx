// subpackages/tuikuan/tuikuan.js
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
    item: {},
    reson: "",
    resonList: [],
    yuanyinvis: false,
    typename: "",
    typeid: 0,
    iftui:0,
    bankxinmin:"",
    bankname:"",
    bankcode:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      iftui:options.deli
    })
    req({
      url: util.baseUrl + "/newapi/api/goods/getgoodstypelist",
      method: "POST",
      data: {
        classid: 9
      },
      success: (res) => {
        this.setData({
          resonList: res.data.data
        })
      }
    })
    this.setData({
      item: app.globalData.tuiItem
    })
  },
  bindTypeChange(e) {
    let data = this.data.resonList[e.detail.value]
    this.setData({
      typename: data.typename,
      typeid: data.typeid
    })
    if (data.typeid === 12) {
      this.setData({
        yuanyinvis: true
      })
    }else{
      this.setData({
        yuanyinvis: false
      })
    }
  },
  refund() {
    if (!this.data.typeid) {
      wx.showToast({
        title: '请选择退款原因',
      })
      return;
    }else if(this.data.typeid==11 && !this.data.reson){
      wx.showToast({
        title: '请填写退款原因',
      })
      return;
    }
    if(this.data.iftui==30){
      if(!this.data.bankxinmin || !this.data.bankname || !this.data.bankcode){
        wx.showToast({
          title: '请填写银行信息',
        })
        return;
      }
    }
    wx.showModal({
      title: '提示',
      content: '是否申请退款',
      success: (ress) => {
        if (ress.confirm) {
          req({
            url: util.baseUrl + "/newapi/api/refund/postform",
            method: "POST",
            data: {
              orderid: parseInt(this.data.item.id),
              reson: this.data.reson,
              openid: wx.getStorageSync('openid'),
              typename:this.data.typename,
              bankxinmin:this.data.bankxinmin,
              bankname:this.data.bankname,
              bankcode:this.data.bankcode
            },
            success: res => {
              if (res.data.status) {
                wx.showToast({
                  title: '申请成功',
                })
                setTimeout(() => {
                  wx.navigateBack();
                }, 2000)
              }
            }
          })
        } else if (ress.cancel) {
          console.log('用户点击取消')
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