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
    dxvis: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      maxmoney: parseFloat(app.globalData.tjyy.unitMoney)
      // maxmoney: 1000
    })
    this.getxm()
    this.gettc()
  },
  getxm() {
    req({
      url: util.baseUrl + "/frontapi/api/tj/gettjprodms",
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
      url: util.baseUrl + "/frontapi/api/tj/gettjprodmst",
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
    
    // 检查是否尝试选择ifcheck为1的项目，且已经选择了其他ifcheck为1的项目
    if (data.ifcheck === 1 && !data.select) {
      // 检查是否已经选择了其他ifcheck为1的项目
      let hasSelectedRequiredItem = false;
      let selectedRequiredItemName = '';
      this.data.xmList.forEach(it => {
        if (it.select && it.ifcheck === 1 && it !== data) {
          hasSelectedRequiredItem = true;
          selectedRequiredItemName = it.prodname || '必选项';
        }
      });
      
      if (hasSelectedRequiredItem) {
        wx.showModal({
          title: '提示',
          content: '您已选择了必选项"' + selectedRequiredItemName + '"，不能同时选择多个必选项',
          showCancel: false
        });
        return;
      }
    }
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
          content: '单独套餐不能和1+X套餐同时选择',
          showCancel: false
        })
        state=false;
      }
    })
    
    // 添加提示信息，告知用户必选项的要求
    if (state) {
      let hasRequiredItem = false;
      let requiredItemCount = 0;
      
      // 检查是否有必选项，以及必选项的数量
      this.data.xmList.forEach(it => {
        if (it.select && it.ifcheck === 1) {
          hasRequiredItem = true;
          requiredItemCount++;
        }
      })
      
      // 如果选择了多个必选项，显示提示并阻止操作
      if (requiredItemCount > 1) {
        wx.showModal({
          title: '提示',
          content: '只能选择一个必选项',
          showCancel: false
        })
        state = false;
        return state;
      }
      
      // 如果已经选择了项目但没有选择必选项，显示提示
      let hasSelectedItems = false;
      this.data.xmList.forEach(it => {
        if (it.select) {
          hasSelectedItems = true;
        }
      })
      
    }
    
    return state;
  },
  isSeltcItem(){
    let state=true;
    this.data.xmList.forEach(it => {
      if (it.select) {
        wx.showModal({
          title: '提示',
          content: '单独套餐不能和1+X套餐同时选择',
          showCancel: false
        })
        state=false;
      }
    })
    return state;
  },
  payment() {
    if (this.data.selectArrs.length === 0) {
      wx.showToast({
        title: '请选择加项'
      })
      return;
    }
    
    // 检查是否只选择了xmList项目，且是否选择了必选项
    let onlyXmListSelected = true;
    let hasRequiredItem = false;
    
    // 检查是否只选择了xmList项目
    this.data.tcList.forEach(it => {
      if (it.select) {
        onlyXmListSelected = false;
      }
    })
    
    // 如果只选择了xmList项目，检查是否选择了必选项
    if (onlyXmListSelected && this.data.selectArrs.length > 0) {
      let requiredItemCount = 0;
      
      this.data.selectArrs.forEach(it => {
        if (it.ifcheck === 1) {
          hasRequiredItem = true;
          requiredItemCount++;
        }
      })
      
      if (!hasRequiredItem) {
        wx.showModal({
          title: '提示',
          content: '1+X套餐请选择一个必选套餐',
          showCancel: false
        })
        return;
      }
      
      // 检查是否选择了多个必选项
      if (requiredItemCount > 1) {
        wx.showModal({
          title: '提示',
          content: '只能选择一个必选项',
          showCancel: false
        })
        return;
      }
    }
    req({
      url: util.baseUrl + "/newapi/api/hd/savetjmx",
      method: "POST",
      data: {
        dataList: this.data.selectArrs,
        tjid: parseInt(app.globalData.tjyy.id),
        openid: wx.getStorageSync('openid'),
        allmoney: parseFloat(this.data.sum),
        corpmoney: this.data.maxmoney,
        personmoney: parseFloat(this.data.personmoney)
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../index/index',
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