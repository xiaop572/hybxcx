// pages/doctorAppoint/doctorAppoint.js
const util = require('../../utils/util')
const { req } = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keshiList: [],
    showNav: true,
    doctorList:[],
    ksbm:'0022',
    currentBr:{
      brxm:"无"
    }
  },
  changeShowNav() {
    this.setData({
      showNav: !this.data.showNav
    })
  },
  changKsbm(e){
    this.setData({
      ksbm:e.currentTarget.dataset.ksbm
    },()=>{
      this.getList()
    })
  },
  rArrangeTime(e) {
    let ygdm=e.currentTarget.dataset.ygdm;
    wx.myNavigateTo({
      url: '../ArrangeTime/ArrangeTime?ygdm='+ygdm,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.sponsor) {
      wx.setStorageSync('sponsor', options.sponsor)
    }
  },
  gettopyyinfo(){
    req({
      url:util.baseUrl+"/newapi/api/yyda/topyyinfo",
      method:"POST",
      data:{
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        if(res.data.status){
          this.setData({
            currentBr:res.data.data[0]
          })
        }
      }
    })
  },
  rqqlist(){
    wx.myNavigateTo({
      url: '../../subpackages/qinqinglist/qinqinglist',
    })
  },
  rmyyy(){
    wx.myNavigateTo({
      url: '../yuyue/yuyue',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getList(){
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getyslist',
      data: {
        ksbm:this.data.ksbm
      },
      success: res => {
        console.log(res,"??")
        this.setData({
          doctorList:res.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getkstree',
      success: res => {
        this.setData({
          keshiList: res.data
        })
        console.log(this.data.keshiList)
      }
    });
    this.getList()
    // this.gettopyyinfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})