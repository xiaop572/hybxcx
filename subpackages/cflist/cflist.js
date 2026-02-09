// subpackages/cflist/cflist.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardList: [],
    currentCard: "",
    it: {},
    brcflist: [],
    cardvis: false,
    bllist: [],
    hhlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getbrbmlist()
  },
  getbrbmlist() {
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
            this.getbrcflist();
          })
        }
      }
    })
  },
  getbrcflist() {
    req({
      url: util.baseUrl + "/newapi/api/mzcf/brcflist",
      method: "POST",
      data: {
        brbm: this.data.currentCard
      },
      success: res => {
        this.setData({
          brcflist: res.data.data
        })
        this.getblmx()
      }
    })
  },
  getblmx() {
    req({
      url: util.baseUrl + "/newapi/api/bl/getblmx",
      method: "POST",
      data: {
        brbm: this.data.currentCard,
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 99999
      },
      success: res => {
        this.setData({
          bllist: res.data.data
        }, () => {
          this.sortlist()
        })
      }
    })
  },
  sortlist() {
    let hhlist = []
    for (let i = 0; i < this.data.brcflist.length; i++) {
      hhlist.push({
        ...this.data.brcflist[i],
        type: "cf"
      })
    }
    for (let j = 0; j < this.data.bllist.length; j++) {
      hhlist.push({
        ...this.data.bllist[j],
        JZSJ:this.data.bllist[j].CYSJ,
        type: "bl"
      })
    }
    this.setData({
      hhlist:hhlist.sort(this.sortUpDate)
    })
    
  },
  sortUpDate(a, b) {
    console.log(a.JZSJ)
    return Date.parse(b.JZSJ) - Date.parse(a.JZSJ);
  },
  rcfxiangqing(e) {
    wx.navigateTo({
      url: '../cfxiangqing/cfxiangqing?id=' + e.currentTarget.dataset.lsh + "&brbm=" + this.data.currentCard,
    })
  },
  rbmzz(e) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.downloadFile({
      // 示例 url，并非真实存在
      url: e.currentTarget.dataset.bgdurl,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          showMenu: true,
          success: function (res) {
            console.log('打开文档成功')
            wx.hideLoading()
          }
        })
      }
    })
  },
  rbangka() {
    app.globalData.jumpurl = "../cflist/cflist"
    wx.myNavigateTo({
      url: "../../subpackages/mybangka/mybangka"
    })
  },
  changecardvis() {
    this.setData({
      cardvis: !this.data.cardvis
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
            this.getbrcflist();
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