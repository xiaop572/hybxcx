// pages/jiaxiang/jiiaxiang.js
var app = getApp()
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tcList: [],
    xmList: [],
    sum: 0,
    selectArrs: [],
    explainContent: "",
    explainShow: false,
    yuanjia: 0,
    maxmoney: 0,
    personmoney: 0,
    dxvis: true,
    tjtype:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      maxmoney: parseFloat(app.globalData.tjyy.unitMoney),
      tjtype:options.tjtype
      // maxmoney: 1000
    })
    this.getxm()
    this.gettc()
  },
  getxm() {
    req({
      url: util.baseUrl + "/frontapi/api/tj/gettjprodhp",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999
      },
      success: res => {
        this.setData({
          xmList: res.data.data
        })
      }
    })
  },
  gettc() {
    req({
      url: util.baseUrl + "/frontapi/api/tj/gettjprodhpt",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999
      },
      success: res => {
        this.setData({
          tcList: res.data.data
        })
      }
    })
  },
  changedxvis() {
    this.setData({
      dxvis: !this.data.dxvis
    })
  },
  selectItem(e) {
    let state=this.isSelItem()
    if(!state){
      return;
    }
    let index = e.currentTarget.dataset.index;
    let data = this.data.xmList[index];
    let moneySum = 0;
    let choseChange = "xmList[" + index + "].select"
    let selectArr = [];
    let yuan = 0;
    let that = this;
    this.setData({
      [choseChange]: !this.data.xmList[index].select,
      sum: 0,
      yuanjia: 0
    }, () => {
      this.data.tcList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      this.data.xmList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      that.setData({
        sum: parseFloat(moneySum).toFixed(2),
        yuanjia: parseFloat(yuan),
        selectArrs: selectArr,
        personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : 0
      })
    })
  },
  selectTcIitem(e) {
    let state=this.isSeltcItem()
    if(!state){
      return;
    }
    let index = e.currentTarget.dataset.index;
    let data = this.data.tcList[index];
    let moneySum = 0;
    let choseChange = "tcList[" + index + "].select"
    let selectArr = [];
    let yuan = 0;
    let that = this;
    this.setData({
      [choseChange]: !this.data.tcList[index].select,
      sum: 0,
      yuanjia: 0
    }, () => {
      this.data.tcList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      this.data.xmList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      that.setData({
        sum: parseFloat(moneySum).toFixed(2),
        yuanjia: parseFloat(yuan),
        selectArrs: selectArr,
        personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : 0
      })
    })
  },
  isSelItem(){
    let state=true;
    this.data.tcList.forEach(it => {
      if (it.select) {
        wx.showModal({
          title: '提示',
          content: '套餐不能与单项同时选择',
          showCancel:false
        })
        state=false;
      }
    })
    return state;
  },
  isSeltcItem(){
    let state=true;
    this.data.xmList.forEach(it => {
      if (it.select) {
        wx.showModal({
          title: '提示',
          content: '套餐不能与单项同时选择',
          showCancel:false
        })
        state=false;
      }
    })
    return state;
  },
  payment() {
    // if (this.data.selectArrs.length === 0) {
    //   wx.showToast({
    //     title: '请选择加项'
    //   })
    //   return;
    // }
    req({
      url: util.baseUrl + "/newapi/api/hd/savetjmx",
      method: "POST",
      data: {
        dataList: this.data.selectArrs,
        tjid: parseInt(app.globalData.tjyy.id),
        openid: wx.getStorageSync('openid'),
        allmoney: parseFloat(this.data.sum),
        corpmoney:0,
        personmoney: parseFloat(this.data.sum)
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../../pages/index/index',
            })
          }, 2000)
        }
      }
    })
  },
  close() {
    console.log(this.data.explainShow)
    this.setData({
      explainShow: !this.data.explainShow
    })
  },
  showExplain(e) {
    this.setData({
      explainContent: e.currentTarget.dataset.exp,
      explainShow: !this.data.explainShow
    })
  },
  noclose() {},
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