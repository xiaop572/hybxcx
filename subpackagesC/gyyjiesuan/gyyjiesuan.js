// pages/jiesuan/jiesuan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    name: "",
    phone: "",
    summary: "",
    probuynum: 1,
    num: 1,
    hasAvailableCoupons: false,
    availableCoupons: [],
    finalPrice: 0, // 最终应付价格
    totalPrice: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let app = getApp();
    let realinfo = wx.getStorageSync('realInfo')
    
    console.log(app.globalData.tc,"app.globalData.tc")
    console.log(app.globalData.tc.selSpec,"app.globalData.tc.selSpec")
    this.setData({
      item: app.globalData.tc
    })
    if (realinfo.realname) {
      this.setData({
        name: realinfo.realname,
        phone: realinfo.mobile
      })
    }
    this.prepaygoods()
    this.getUserCouponsForProduct()
  },
  prepaygoods() {
    let app = getApp();
    app.globalData.tc = this.data.item;
    // selSpec已经在tcxq页面设置好了，这里不需要重新设置
    req({
      url: util.baseUrl + "/newapi/api/goods/prepaygoods",
      method: "POST",
      data: {
        orderTitle: this.data.item.pictitle,
        openId: wx.getStorageSync('openid'),
        ptype: this.data.item.ptype,
        proid: this.data.item.id
      },
      success: (res) => {
        this.setData({
          probuynum: res.data.data.probuynum
        })
      }
    })
  },
  // 获取商品可用优惠券
  getUserCouponsForProduct() {
    req({
      url: util.baseUrl + "/newapi/api/coupon/getusercouponsforproduct",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        productId: this.data.item.id || 0,
        status: 0, // 0表示未使用的优惠券
        page: 1,
        limit: 10
      },
      success: (res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          this.setData({
            hasAvailableCoupons: true,
            availableCoupons: res.data.data
          }, () => {
            this.calculateFinalPrice()
          })
        } else {
          this.setData({
            hasAvailableCoupons: false,
            availableCoupons: [],
            finalPrice: 0, // 最终应付价格
            totalPrice: 0
          }, () => {
            this.calculateFinalPrice()
          })
        }
      },
      fail: (err) => {
        console.error('获取优惠券失败:', err)
        this.setData({
          hasAvailableCoupons: false,
          availableCoupons: []
        }, () => {
          this.calculateFinalPrice()
        })
      }
    })
  },
  calculateFinalPrice() {
    // Correctly calculate total price: unit price * quantity
    let totalPrice = parseFloat((this.data.item.price * this.data.num).toFixed(2));
    let discountAmount = 0;

    if (this.data.hasAvailableCoupons && this.data.availableCoupons.length > 0) {
      // Use the discount amount of the first available coupon
      discountAmount = parseFloat(this.data.availableCoupons[0].DiscountValue || 0);
    }

    // Calculate the final price and keep two decimal places
    let finalPrice = parseFloat(Math.max(0, totalPrice - discountAmount).toFixed(2));

    this.setData({
      finalPrice: finalPrice,
      totalPrice: totalPrice // Also update a new data property for the total price if needed
    });
  },
  numjia() {
    if (this.data.num < this.data.probuynum) {
      this.setData({
        num: this.data.num + 1
      }, () => {
        this.calculateFinalPrice()
      })
    }
  },
  numjian() {
    if (this.data.num > 1) {
      this.setData({
        num: this.data.num - 1
      }, () => {
        this.calculateFinalPrice()
      })
    }
  },
  // 处理数量输入
  onNumInput(e) {
    let inputValue = e.detail.value
    // 允许用户清空输入框，实时更新显示值
    this.setData({
      num: inputValue === '' ? '' : parseInt(inputValue) || ''
    })
  },
  // 处理数量输入失焦
  onNumBlur(e) {
    let inputValue = e.detail.value
    let value = parseInt(inputValue)
    
    // 如果输入为空或无效，设置为1
    if (!inputValue || isNaN(value) || value < 1) {
      value = 1
      if (inputValue && isNaN(parseInt(inputValue))) {
        wx.showToast({
          title: '请输入有效数字',
          icon: 'none'
        })
      }
    } else if (value > this.data.probuynum) {
      value = this.data.probuynum
      wx.showToast({
        title: `数量不能超过${this.data.probuynum}`,
        icon: 'none'
      })
    }
    
    // 更新数量并重新计算价格
    this.setData({
      num: value
    }, () => {
      this.calculateFinalPrice()
    })
  },
  payment() {
    let that = this;
    if (!this.data.name || !this.data.phone) {
      wx.showToast({
        title: '请填写姓名手机',
      })
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    
    // 构建请求参数
    let requestData = {
      "summary": that.data.summary,
      "orderTitle": that.data.item.pictitle,
      "OutTradeNo": String(+new Date()),
      "TotalFee": that.data.finalPrice,
      "openId": wx.getStorageSync('openid'),
      "xinmin": that.data.name,
      "mobile": that.data.phone,
      "Source": wx.getStorageSync('sponsor'),
      "ptype": 18,
      "proid": that.data.item.id,
      "spes": that.data.item.selSpec,
      num: this.data.num
    };
    
    // 如果有可用优惠券，添加优惠券代码
    if (that.data.hasAvailableCoupons && that.data.availableCoupons.length > 0) {
      requestData.CouponCode = that.data.availableCoupons[0].CouponCode || that.data.availableCoupons[0].code;
    }
    
    req({
      url: util.baseUrl + "/newapi/api/park/prepackpaynum",
      method: "POST",
      data: requestData,
      success: (res) => {
        if (!res.data.status) {
          wx.hideLoading({})
          wx.showModal({
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        wx.hideLoading({})
        wx.requestPayment({
          ...res.data.data,
          success: (ress) => {
            if (ress.errMsg === "requestPayment:ok") {
              wx.showToast({
                title: '支付成功'
              })
              if (res.data.otherData) {
                wx.redirectTo({
                  url: res.data.otherData,
                })
              } else {
                wx.redirectTo({
                  url: '/pages/kaquan/kaquan',
                })
              }
            }
          },
          fail(res) {

          }
        })

      }
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