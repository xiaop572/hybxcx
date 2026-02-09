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
    app.globalData.jumpurl="../jianyanList/jianyanList"
    this.getcardlist();
    this.getc13();
  },
  rbangka() {
    wx.myNavigateTo({
      url: "../../subpackages/mybangka/mybangka"
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
      url: util.baseUrl + "/newapi/api/brda/getlismx",
      method: "POST",
      data: {
        brbm: this.data.currentCard,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        this.setData({
          yxList: res.data.data
        },()=>{
          this.getc13()
        })
      }
    })
  },
  getc13(){
    req({
      url: util.baseUrl + "/pw/hisInterface/get_c13pdf",
      method: "GET",
      data: {
        brbm: this.data.currentCard
      },
      success: (res) => {
        console.log(res)
      }
    })
  },
  rjyjg(e) {
    console.log("??")
    wx.navigateTo({
      url: '/pages/jianyanjieguo/jianyanjieguo?sampleda=' + e.currentTarget.dataset.sampleda + "&instrid=" + e.currentTarget.dataset.instrid + "&sampleno=" + e.currentTarget.dataset.sampleno + "&brbm=" + this.data.currentCard
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