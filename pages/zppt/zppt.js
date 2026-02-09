const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

// pages/pthd/pthd.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prizes: ['1000元无门槛抵用卷', '肩颈疼痛调理1次', '单人基础体检套餐', '超声洁牙1次', '医用面膜1片', '没中奖','点痣点疣1颗','和悦会99元入会礼'],
    priimg: ['', 'https://wx.pmc-wz.com/materials/zppro1.jpg', '', 'https://wx.pmc-wz.com/materials/zppro3.jpg', 'https://wx.pmc-wz.com/materials/zppro4.jpg','','https://wx.pmc-wz.com/materials/zppro6.jpg','https://wx.pmc-wz.com/materials/zppro7.jpg'],
    rotateDeg: 0,
    isRunning: false,
    showjp: false,
    priindex: -1,
    prolist: [{
        label: "整形专区",
        id: 68
      },
      {
        label: "口腔专区",
        id: 62
      }, {
        label: "产康专区",
        id: 63
      }, {
        label: "健康专区",
        id: 69
      },
    ],
    curindex: 68,
    pros: []
  },
  changeproindex(e) {
    let data = e.currentTarget.dataset;
    this.setData({
      curindex: data.id
    }, () => {
      this.getpro()
    })
  },
  guanbi() {
    this.setData({
      showjp: !this.data.showjp
    })
  },
  getpro() {
    req({
      url: util.baseUrl + "/newapi/api/goods/pintuanpagelist",
      method: "POST",
      data: {
        "stype": this.data.curindex,
        "curpage": 1,
        "limit": 10000,
        "searchkey": "",
        "sort": 0
      },
      success: res => {
        this.setData({
          pros: res.data.data
        })
      }
    })
  },
  rdjck() {
    this.setData({
      showjp: false
    })
    wx.navigateTo({
      url: '../../subpackages/mycard/mycard',
    })
  },
  rpro(e) {
    wx.myNavigateTo({
      url: '../../subpackages/pintuanPro/pintuanPro?id=' + e.currentTarget.dataset.id,
    })
  },
  startLottery: function () {
    req({
      url: util.baseUrl + "/newapi/api/huodong/getzhuanpan",
      method: "post",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        let result = null;
        if (res.data.status) {
          if (this.data.isRunning) return;
          this.setData({
            isRunning: true
          });
          this.data.prizes.forEach((element, index) => {
            if (res.data.msg == element) {
              result = index;
              this.setData({
                priindex: index
              })
            }
          });
          console.log(result);
          // 计算需要旋转的角度
          const rotateDeg = 360 * 6 - (result * 45);
          console.log(rotateDeg)
          this.setData({
            rotateDeg: rotateDeg
          });

          setTimeout(() => {
            if (result != 6) {
              this.setData({
                showjp: true
              })
            } else {
              wx.showModal({
                title: '提示',
                content: "感谢参与",
                showCancel: false,
                success: () => {}
              });
            }
          }, 3000);
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: () => {}
          });
        }
      }

    })



  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    this.getpro()
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
    return {
      title: "姐妹拼团，限时嗨购0.1元起，健康美丽好物钜惠派送中……",
      imageUrl: "https://wx.pmc-wz.com/materials/jkjptfxt.jpg",
      path: '/pages/pthd/pthd?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline() {
    return {
      title: "姐妹拼团，限时嗨购0.1元起，健康美丽好物钜惠派送中……",
      imageUrl: "https://wx.pmc-wz.com/materials/jkjptfxt.jpg",
      path: '/pages/pthd/pthd?fromid=' + wx.getStorageSync('openid'),
    }
  },
})