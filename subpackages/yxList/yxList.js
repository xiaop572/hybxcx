// pages/yxList/yxList.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yxList: [],
    cardList: [],
    cardvis: false,
    currentCard: "",
    it: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let app=getApp();
    app.globalData.jumpurl="../yxList/yxList"
    this.getcardlist();
  },
  rbangka(){
    wx.myNavigateTo({
      url:"../../subpackages/mybangka/mybangka"
    })
  },
  getcardlist() {
    req({
      url: util.baseUrl + "/newapi/api/brda/bindmylist",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        console.log(res,"卡列表")
        let arr = []
        if (res.data.status) {
          if (res.data.data.length <= 0) {
            wx.showToast({
              title: '请先绑卡',
            })
            setTimeout(() => {
              wx.navigateTo({
                url: '../mybangka/mybangka',
              })
            }, 1500)
          }
          for (let i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].iftop === 1) {
              let item = res.data.data.splice(i, 1);
              this.setData({
                it: item[0],
                currentCard: item[0]['brbm']
              })
              arr[0] = item[0];
            }
          }
          arr = arr.concat(res.data.data)
          this.setData({
            cardList: arr
          }, () => {
            this.getkylist();
          })
        }
      }
    })
  },
  getkylist() {
    req({
      url: util.baseUrl + "/newapi/api/brda/getkylist",
      method: "POST",
      data: {
        brbm: this.data.currentCard,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        this.setData({
          yxList: res.data.data
        })
      }
    })
  },
  ryxyq(e) {
    let app = getApp();
    app.globalData.yxpat_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../yxxq/yxxq',
    })
  },
  selectCard(e) {
    let brbm = e.currentTarget.dataset.brbm;
    req({
      url: util.baseUrl + "/newapi/api/brda/sztopcard",
      method: "POST",
      data: {
        brbm,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '选择成功',
          })
          this.setData({
            cardvis: false,
            currentCard: brbm
          }, () => {
            this.getcardlist();
          })

        }
      }
    })
  },
  changecardvis() {
    this.setData({
      cardvis: !this.data.cardvis
    })
  },
  no() {

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