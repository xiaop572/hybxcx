// subpackages/tjpdf/tjpdf.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 0,
    xinmin: "",
    lxdh: "",
    sfz: "",
    checkcode: "",
    chasuc: false,
    tjlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
  changephone(e) {
    let phone = e.detail.value
    phone = phone.replace(/\s*/g, "");

    this.setData({
      lxdh: phone
    })
  },
  getcode() {
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请输入姓名',
      })
      return;
    } else if (!this.data.lxdh) {
      wx.showToast({
        title: '请输入手机号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/brda/sendzylistmobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.lxdh
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            code: res.data.data,
            num: 60
          }, () => {
            this.countTime()
          })
        }
      }
    })
  },
  next() {
    this.getzybl()
  },
  // 获取住院病人的病理报告
  getzybl() {
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    if (!this.data.lxdh) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '查询中...'
    });
    
    req({
      url: util.baseUrl + "/newapi/api/bl/getzybl",
      method: "post",
      data: {
        brxm: this.data.xinmin,
        mobile: this.data.lxdh,
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 10000
      },
      success: res => {
        wx.hideLoading();
        if (res.data.status) {
          this.setData({
            tjlist: res.data.data || [],
            chasuc:true
          });
          if (!res.data.data || res.data.data.length === 0) {
            wx.showToast({
              title: '暂无病理报告',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: res.data.message || '查询失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },
  rzybglist(e) {
    let data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../zybglist/zybglist?zyhm=' + data.zyhm + '&type=' + data.type + "&brxm=" + data.brxm + "&ryrq=" + data.ryrq,
    })
  },
  countTime() {
    console.log(this.data.num)
    if (this.data.num <= 0) {
      return;
    }
    this.setData({
      num: this.data.num - 1
    })
    setTimeout(() => {
      this.countTime();
    }, 1000)
  },
  cx() {
    this.setData({
      chasuc: false
    })
  },
  lookpdf(e) {
    console.log(e)
    wx.showLoading({
      title: '加载中...',
    })
    wx.downloadFile({
      // 示例 url，并非真实存在
      url: e.currentTarget.dataset.pdf,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          showMenu: true,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    wx.hideLoading()
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