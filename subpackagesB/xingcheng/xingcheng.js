// subpackagesB/xingcheng/xingcheng.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 99,
    jbinfo: {},
    topinfo:[],
    jbxc: [],
    jbyc: [],
    dhinfo: [],
    jbzs: [],
    jbyc: [],
    cwbx: {},
    txl: [],
    tq: [],
    jbzc:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
    }
    this.getjbinfo();
    this.getjbxc();
    this.getjbyj();
    this.getdhinfo();
    this.getjbzs();
    this.getjbyc();
    this.getcwbx();
    this.gettxl();
    this.gettq();
    this.getzclist()
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
  getjbinfo() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabininfo",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        let data=res.data.data;
        let topinfo=data.topinfo.split("|||");
        this.setData({
          jbinfo: res.data.data,
          topinfo
        })
      }
    })
  },
  getzclist(){
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getzclist",
      method: "post",
      data: {
        jbid: this.data.id
      },
      success: res => {
        this.setData({
          jbzc: res.data.data
        })
      }
    })
  },
  getjbxc() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabinxc",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          jbxc: res.data.data
        })
      }
    })
  },
  getjbyj() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabinyj",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          jbyj: res.data.data
        })
      }
    })
  },
  getdhinfo() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getdahui",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          dhinfo: res.data.data
        })
      }
    })
  },
  getjbzs() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabinzs",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          jbzs: res.data.data
        })
      }
    })
  },
  getjbyc() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabinyc",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          jbyc: res.data.data
        })
      }
    })
  },
  getcwbx() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getcaiwu",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          cwbx: res.data.data
        })
      }
    })
  },
  gettxl() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/gettxl",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          txl: res.data.data
        })
      }
    })
  },
  gettq() {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/gettq",
      method: "post",
      data: {
        id: this.data.id
      },
      success: res => {
        this.setData({
          tq: res.data.data
        })
      }
    })
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
  boda(){
    wx.makePhoneCall({
      phoneNumber: this.data.jbinfo.fzrdh //仅为示例，并非真实的电话号码
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.jbinfo.name+"的个人行程",
      imageUrl: "https://wx.pmc-wz.com/materials/jbxcfxt.png",
      path: '/subpackagesB/xingcheng/xingcheng?id=' + this.data.id
    }
  },
  onShareTimeline() {
    return {
      title: this.jbinfo.name+"的个人行程",
      imageUrl: "https://wx.pmc-wz.com/materials/jbxcfxt.png",
      path: '/subpackagesB/xingcheng/xingcheng?id=' + this.data.id
    }
  },
})