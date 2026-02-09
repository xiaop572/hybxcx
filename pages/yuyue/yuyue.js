// pages/yuyue/yuyue.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yyList: [],
    currentIndex: 0,
    tjList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (!util.realExist()) {
      wx.showModal({
        title: '提示',
        content: '请填写真实信息后预约',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../realInfo/readlInfo'
            })
          } else {
            wx.switchTab({
              url: '../my/my',
            })
          }
        }
      })
    } else {
      if(options.type==2){
        this.setData({
          currentIndex:1
        })
      }
      this.getYYXX()
      this.geTtjxx()
    }
  },
  canceltjxx(e) {
    let that=this;
    let row = e.currentTarget.dataset.row;
    if(row.OrderStatus==20){
      return;
    }
    console.log(row)
    wx.showModal({
      title: '提示',
      content: '是否取消体检预约？',
      success(res) {
        if (res.confirm) {
          req({
            url: util.baseUrl + '/newapi/api/tj/canceltjyuyue',
            method: 'POST',
            data: {
              openid: wx.getStorageSync('openid'),
              tjid: row.Id
            },
            success: res => {
              if (res.data.status) {
                that.geTtjxx()
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  getYYXX() {
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getyyxxmy',
      method: 'POST',
      data: {
        YYLSH: "0",
        SJHM: wx.getStorageSync('realInfo').mobile,
        BRLY: "QYY"
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            yyList: res.data.data
          })
        }
      }
    })
  },
  geTtjxx() {
    req({
      url: util.baseUrl + '/newapi/api/tj/getyuyuetjpage',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 99999
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            tjList: res.data.data
          })
        }
      }
    })
  },
  cancelyyxx(e) {
    let row = e.currentTarget.dataset.row;
    if (row.JZZT !== '已预约') {
      return;
    }
    let params = {
      YYLSH: row.YYLSH,
      BRXM: row.BRXM,
      SJHM: row.LXDH,
      BRLY: "QYY"
    }
    
    wx.showModal({
      title: '提示',
      content: '是否取消预约？',
      success:res=>{
        req({
          url: util.baseUrl + '/newapi/api/mzyy/cancelyyxx',
          method: 'POST',
          data: params,
          success: res => {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '取消成功'
            })
            this.getYYXX()
          }
        })
      }
    })
    
  },
  pagechange: function (e) {
    // 通过touch判断，改变tab的下标值
    if ("touch" === e.detail.source) {
      let currentPageIndex = this.data.currentIndex;
      currentPageIndex = (currentPageIndex + 1) % 2;
      // 拿到当前索引并动态改变
      this.setData({
        currentIndex: currentPageIndex,
      })
    }
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
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