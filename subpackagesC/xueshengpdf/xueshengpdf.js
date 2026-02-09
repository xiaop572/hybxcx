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
    mobile: "",
    checkcode: "",
    chasuc: false,
    tjlist: [],
    lslist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let pdflist = wx.getStorageSync('pdflist');
    this.setData({
      lslist: pdflist
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
  changephone(e) {
    let phone = e.detail.value
    phone = phone.replace(/\s*/g, "");

    this.setData({
      phone: phone
    })
  },
  getcode() {
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请输入姓名',
      })
      return;
    } else if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/weilan/sendwlmobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.phone,
        xinmin: this.data.xinmin
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
  lschaxun(e) {
    let data = e.currentTarget.dataset.item;
    this.setData({
      xinmin: data.xinmin,
      phone: data.mobile,
      checkcode: data.checkcode
    }, () => {
      this.next()
    })
  },
  next() {
    req({
      url: util.baseUrl + "/newapi/api/weilan/xuepdflist",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        cardno: this.data.phone,
        xinmin: this.data.xinmin,

      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '查询成功',
          })
          this.setData({
            tjlist: res.data.data,
            chasuc: true
          }, () => {
            this.setbglist()
          })
        } else {
          wx.showToast({
            title: '验证失败',
          })
        }
      }
    })
  },
  setbglist() {
    let pdflist = wx.getStorageSync('pdflist');
    let iscun = -1;
    let isstate = false;
    if (!pdflist) {
      pdflist = []
    }
    for (let i = 0; i < pdflist.length; i++) {
      if (pdflist[i].xinmin == this.data.xinmin) {
        iscun = i;
        isstate = true;
      }
    }
    if (isstate) {
      pdflist.splice(iscun, 1);
    }
    pdflist.push({
      checkcode: this.data.checkcode,
      mobile: this.data.phone,
      xinmin: this.data.xinmin
    })
    wx.setStorageSync('pdflist', pdflist.reverse())
    this.setData({
      lslist: pdflist
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
          fileType:"pdf",
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      }
    })
  },
  copyPath(e) {
    const pdfUrl = e.currentTarget.dataset.pdf;
    wx.setClipboardData({
      data: pdfUrl,
      success: function (res) {
        wx.showToast({
          title: '路径已复制',
          icon: 'success'
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
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