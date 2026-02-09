// pages/ynbb/ynbb.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bmlist: ["1.内镜中心", "2.影像中心", "3.体检中心", "4.住院", "5.康复中心","6.口腔中心"
    ],
    qudaoList: ["员工介绍", "线下运营团队", "网络营销"],
    xinbieList: ["男", "女"],
    zhuyuanList: ["是", "否"],
    params: {
      xingmin: "",
      jzbumen: "",
      laiyuan: "恒泽",
      year: "",
      tel: "",
      laiyuanriqi: "",
      beizhu: "",
      qudaotype:""
    },
    xingmin: "",
    jzbumen: "",
    laiyuan: "",
    year: "",
    tel: "",
    laiyuanriqi: "",
    beizhu: "",
    issub: true,
    id:"",
    qudaotype:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(!options.id){
      wx.showModal({
        title: '提示',
        content: '请通过扫描二维码进入',
        showCancel:false
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../../pages/index/index',
        })
      }, 2000);
      return;
    }
    this.setData({
      id:options.id
    })
    req({
      url:util.baseUrl+"/newapi/api/Baobei/getclinic",
      method:"POST",
      data:{
        qudaotype:options.id
      },
      success:res=>{
        this.setData({
          laiyuan:res.data.data.name
        })
      }
    })
  },
  bindbmchange(e) {
    this.setData({
      params: {
        ...this.data.params,
        jzbumen: this.data.bmlist[e.detail.value]
      }
    })
  },
  bindlychange(e) {
    this.setData({
      params: {
        ...this.data.params,
        laiyuan: this.data.qudaoList[e.detail.value]
      }
    })
  },
  bindxbchange(e) {
    this.setData({
      params: {
        ...this.data.params,
        xinbie: this.data.xinbieList[e.detail.value]
      }
    })
  },
  bindzychange(e) {
    this.setData({
      params: {
        ...this.data.params,
        ifzy: this.data.zhuyuanList[e.detail.value]
      }
    })
  },
  bindpaychange(e) {
    this.setData({
      params: {
        ...this.data.params,
        ifpay: this.data.zhuyuanList[e.detail.value]
      }
    })
  },
  bindlyrqchange(e) {
    this.setData({
      params: {
        ...this.data.params,
        laiyuanriqi: e.detail.value
      }
    })
  },
  rtijiao() {
    if (!this.data.issub) {
      return;
    }
    if (!this.data.xingmin || !this.data.params.jzbumen || !this.data.tel || !this.data.params.laiyuanriqi || !this.data.laiyuan) {
      wx.showToast({
        title: '请填写必填信息',
      })
      return;
    }
    wx.showLoading({
      title: '提交中...',
    })
    this.setData({
      issub: false,
      params: {
        ...this.data.params,
        xingmin: this.data.xingmin,
        year: this.data.year,
        cardno: this.data.cardno,
        tel: this.data.tel,
        beizhu: this.data.beizhu,
        laiyuan: this.data.laiyuan,
        qudaotype:this.data.id,
      }
    }, () => {
      req({
        url: util.baseUrl + "/yuanapi/api/Baobei/getdsf",
        method: "POST",
        data: {
          ...this.data.params,
          openid: wx.getStorageSync('openid')
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.status) {
            wx.showModal({
              title: '提交成功',
              content: res.data.msg,
              showCancel: false
            })
          } else {
            wx.showModal({
              title: '提交失败',
              content: res.data.msg,
              showCancel: true
            })
          }
          this.setData({
            issub: true
          })
        }
      })
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