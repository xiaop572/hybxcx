// pages/ArrangeTime/ArrangeTime.js
const { req } = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: "",
    selectTime: "",
    doctor: {

    },
    haoyuan: [],
    timeList: [],
    pbxxs: {},
    xh:"",
    selectRq:""
  },
  showTime(e) {
    let data = e.currentTarget.dataset;
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getysdetail',
      method: "POST",
      data: {
        KSBM: data.row.Ksbm,
        PBLSH: String(data.row.Lsh),
        DATE: data.rq
      },
      success: res => {
        this.setData({
          timeList: res.data.pbxxs[0].XHLB,
          pbxxs: res.data.pbxxs[0]
        })
        if (this.data.selectIndex === data.idx) {
          // this.setData({
          //   selectIndex:"",
          //   selectTime:""
          // })
        } else {
          this.setData({
            selectIndex: data.idx,
            selectTime: ""
          })
        }
      }
    })


  },
  selectTime(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      selectTime: e.currentTarget.dataset.time,
      xh:e.currentTarget.dataset.xh,
      selectRq:e.currentTarget.dataset.rq
    })
  },
  submit() {
    if (this.data.selectTime) {
      if (!util.realExist()) {
        wx.showModal({
          title: '提示',
          content: '请填写真实信息后预约',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../realInfo/readlInfo'
              })
            }
          }
        })
      } else {
        let userInfo=wx.getStorageSync('realInfo');
        let haoyuanInfo = this.data.haoyuan[this.data.selectIndex];
        // wx.request({
        //   url: util.baseUrl+'/newapi/api/mzyy/addyyxx',
        // })
        let params = {
          YYLSH: "0",
          PBLSH: haoyuanInfo.Lsh,
          YYXH:this.data.xh,
          YYSJ:this.data.selectRq,
          BRXM:userInfo.realname,
          SJHM:userInfo.mobile,
          BRDZ:"",
          SFZH:userInfo.cardno,
          BRLY:"QYY"
        }
        req({
          url: util.baseUrl+'/newapi/api/mzyy/addyyxx',
          data:params,
          method:'POST',
          success:res=>{
            wx.showModal({
              title: '提示',
              content: res.data,
              showCancel:false
            })
          }
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   req({
      url: util.baseUrl + '/newapi/api/mzyy/getysjjysbm',
      data: {
        ysbm: options.ygdm
      },
      success: res => {
        this.setData({
          doctor: res.data[0]
        })
      }
    })
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getpbxxlistwithysbm',
      data: {
        ysbm: options.ygdm
      },
      success: res => {
        this.setData({
          haoyuan: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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