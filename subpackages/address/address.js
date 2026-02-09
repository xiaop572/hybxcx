// subpackages/address/address.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Name: "",
    Mobile: "",
    Province: "",
    City: "",
    County: "",
    Address: "",
    merchantOrderNo: "",
    region: ["浙江省", "温州市"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  bindRegionChange(e) {
    let value = e.detail.value
    this.setData({
      Province: value[0],
      City: value[1],
      County: value[2]
    })
    console.log('picker发送选择改变，携带值为', e.detail.value)
  },
  submit() {
    if (!this.data.Name) {
      wx.showToast({
        title: '请填写收货人',
      })
      return;
    } else if (this.data.Mobile.length !== 11) {
      wx.showToast({
        title: '手机号为11位',
      })
      return;
    } else if (!this.data.Province && !this.data.City && !this.data.County) {
      wx.showToast({
        title: '请选择省市区',
      })
      return;
    } else if (!this.data.Address) {
      wx.showToast({
        title: '请填写详细地址',
      })
      return;
    } else if (!this.data.merchantOrderNo) {
      wx.showToast({
        title: '请填写体检号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/sf/insertaddress",
      method: "POST",
      data: {
        Openid: wx.getStorageSync('openid'),
        Name: this.data.Name,
        Mobile: this.data.Mobile,
        Province: this.data.Province,
        City: this.data.City,
        County: this.data.County,
        Address: this.data.Address,
        merchantOrderNo: this.data.merchantOrderNo
      },
      success: res => {
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: '提交成功',
            showCancel: false
          })
        } else {
          wx.showToast({
            title: '提交失败',
          })
        }
      }
    })
  },
  saoyisao() {
    wx.scanCode({
      success: res => {
        console.log(res)
        if (res.errMsg === 'scanCode:ok') {
          if (res.result.length !== 10) {
            wx.showToast({
              title: '条码错误请重试',
            })
            return;
          }
          this.setData({
            merchantOrderNo: (this.data.merchantOrderNo ? this.data.merchantOrderNo + "," : "") + res.result
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