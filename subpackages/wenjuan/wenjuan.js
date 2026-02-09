// subpackages/wenjuan/wenjuan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wentitype: [
      "无",
      "医疗类",
      "护理类",
      "信息类",
      "总务类",
      "行政类",
      "品宣类",
      "设备类",
      "人事类",
      "保洁类",
      "食堂类",
      "财务类",
      "医保类",
      "院感类",
      "运营类",
      "其他类"
    ],
    benkstype: "",
    qitakstype: "",
    xinmin: "",
    keshi: "",
    totalwenti: "",
    benkswenti: "",
    qitakswenti: "",
    other: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  bindtypechange(e) {
    this.setData({
      benkstype: this.data.wentitype[e.detail.value]
    })
  },
  bindtype2change(e) {
    this.setData({
      qitakstype: this.data.wentitype[e.detail.value]
    })
  },
  binddatechange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  submit() {
    if (!this.data.keshi) {
      wx.showToast({
        title: '请填写科室',
      })
      return;
    } else if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名',
      })
      return;
    }
    // else if (!this.data.totalwenti) {
    //   wx.showToast({
    //     title: '请完善第三点',
    //   })
    //   return;
    // } 
    else if (!this.data.benkstype) {
      wx.showModal({
        title: '提示',
        content: "请完善本科室问题",
        showCancel: false
      })
      return;
    } else if (this.data.benkstype !== '无' && !this.data.benkswenti) {
      wx.showModal({
        title: '提示',
        content: "请完善本科室问题",
        showCancel: false
      })
      return;
    } else if (!this.data.qitakstype) {
      wx.showModal({
        title: '提示',
        content: "请完善其他科室问题",
        showCancel: false
      })
      return;
    } else if (this.data.qitakstype !== '无' && !this.data.qitakswenti) {
      wx.showModal({
        title: '提示',
        content: "请完善其他科室问题",
        showCancel: false
      })
      return;
    } else if (!this.data.date) {
      wx.showToast({
        title: '请选择解决时间',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/sm/questsend",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        xinmin: this.data.xinmin,
        keshi: this.data.keshi,
        date: this.data.date,
        other: this.data.other,
        totalwenti: this.data.totalwenti,
        benkswenti: this.data.benkswenti,
        benkstype: this.data.benkstype,
        qitakstype: this.data.qitakstype,
        qitakswenti: this.data.qitakswenti
      },
      success: res => {
        wx.showModal({
          title: '提示',
          content: '提交成功',
          showCancel: false,
          complete: (res) => {
            wx.switchTab({
              url: '../../pages/index/index',
            })
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