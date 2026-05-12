// pages/basicPro/basicPro.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
var app = getApp()
const CART_KEY = 'gyy_cart'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mername: "",
    sortIndex: 1,
    ptype: 0,
    proList: [],
    priceSort: false,
    cartList: [],
    cartCount: 0,
    cartTotalPrice: "0.00",
    showCartPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options, "???")
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      if (options.scene.length == 2) {
        options.id = options.scene
      } else {
        let arr = options.scene.split('&');
        if (arr.length < 2) {
          arr = options.scene.split('%26');
        }
        wx.setStorageSync('sponsor', arr[0]);
      }

    }
    var that = this;
    req({
      url: util.baseUrl + "/newapi/api/goods/getonetype",
      data: {
        id: options.id
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            mername: res.data.data.typename
          }, () => {
            wx.setNavigationBarTitle({
              title: res.data.data.typename
            })
          })
        }
      }
    })
    this.setData({
      ptype: 124
    })
    this.initCart()
    this.getPro()
  },
  initCart() {
    this.getCartListByApi()
  },
  getCartListByApi(callback) {
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      this.setData({
        cartList: [],
        cartCount: 0,
        cartTotalPrice: "0.00"
      })
      if (callback) {
        callback([])
      }
      return
    }
    req({
      url: util.baseUrl + "/newapi/api/cart/cartlist",
      method: "POST",
      data: {
        openid
      },
      success: res => {
        if (!res.data || !res.data.status) {
          return
        }
        const rawList = Array.isArray(res.data.data) ? res.data.data : []
        const cartList = rawList
          .map(this.normalizeCartItem)
          .filter(item => item && item.id)
        this.setData({
          cartList,
          cartCount: this.getCartCount(cartList),
          cartTotalPrice: this.getCartTotalPrice(cartList)
        }, () => {
          if (callback) {
            callback(cartList)
          }
        })
      }
    })
  },
  normalizeCartItem(item) {
    const id = item.id || item.proid || item.goodsid || item.gid
    const proid = item.proid || item.goodsid || item.gid || item.productid || item.id
    const cartNum = Number(item.cartNum || item.nums || item.num || item.buynum || item.quantity || 1)
    return {
      ...item,
      id,
      proid,
      pictitle: item.pictitle || item.goodstitle || item.goodsname || item.protitle || '',
      price: item.price || item.saleprice || item.proprice || 0,
      picurl: item.picurl || item.pic || item.goodsimg || '',
      cartNum: cartNum > 0 ? cartNum : 1
    }
  },
  getCartFromStorage() {
    const list = this.data.cartList
    if (!Array.isArray(list)) {
      return []
    }
    return list.filter(item => item && item.id).map(item => ({
      ...item,
      cartNum: Number(item.cartNum) > 0 ? Number(item.cartNum) : 1
    }))
  },
  saveCart(cartList) {
    wx.setStorageSync(CART_KEY, cartList)
    this.setData({
      cartList,
      cartCount: this.getCartCount(cartList),
      cartTotalPrice: this.getCartTotalPrice(cartList)
    })
  },
  getCartCount(cartList) {
    return cartList.reduce((sum, item) => sum + (Number(item.cartNum) || 0), 0)
  },
  getCartTotalPrice(cartList) {
    const total = cartList.reduce((sum, item) => {
      return sum + (Number(item.price) || 0) * (Number(item.cartNum) || 0)
    }, 0)
    return total.toFixed(2)
  },
  getPro() {
    req({
      url: util.baseUrl + "/newapi/api/goods/goodspagelist",
      method: "POST",
      data: {
        "stype": this.data.ptype,
        "curpage": 1,
        "limit": 99999,
        "searchkey": "",
        "sort": this.data.sortIndex
      },
      success: res => {
        this.setData({
          proList: res.data.data
        })
      }
    })
  },
  rSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  PriceSortPro() {
    this.setData({
      sortIndex: this.data.sortIndex === 9 ? 2 : 9,
      priceSort: true
    }, () => {
      this.getPro()
    })
  },
  sortPro(e) {
    if (this.data.sortIndex !== e.currentTarget.dataset.sort) {
      this.setData({
        sortIndex: parseInt(e.currentTarget.dataset.sort),
        priceSort: false
      }, () => {
        this.getPro()
      })
    }
  },
  rtcxq(e) {
    console.log(e)
    let app = getApp();
    app.globalData.tc = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: "/subpackagesC/gyyjiesuan/gyyjiesuan"
    })
  },
  addToCart(e) {
    const item = e.currentTarget.dataset.item
    if (!item || !item.id) {
      return
    }
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    req({
      url: util.baseUrl + "/newapi/api/cart/addpro2cart",
      method: "POST",
      data: {
        openid,
        proid: Number(item.id) || 0,
        specid: Number(item.specid) || 0,
        nums: 1
      },
      success: res => {
        if (res.data && res.data.status) {
          wx.showToast({
            title: '已加入购物车',
            icon: 'success'
          })
          this.getCartListByApi()
          return
        }
        wx.showToast({
          title: (res.data && res.data.msg) || '加入失败',
          icon: 'none'
        })
      }
    })
  },
  toggleCartPopup() {
    this.setData({
      showCartPopup: !this.data.showCartPopup
    })
  },
  hideCartPopup() {
    this.setData({
      showCartPopup: false
    })
  },
  noop() {},
  updateCartNumByApi(item, nums) {
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    req({
      url: util.baseUrl + "/newapi/api/cart/addsub2cart",
      method: "POST",
      data: {
        openid,
        proid: Number(item.proid || item.id) || 0,
        specid: Number(item.specid) || 0,
        nums
      },
      success: res => {
        if (res.data && res.data.status) {
          // 接口成功后先做本地同步，避免列表接口延迟导致数量不刷新的体验问题
          const cartList = this.getCartFromStorage()
          const idx = cartList.findIndex(cartItem =>
            String(cartItem.proid || cartItem.id) === String(item.proid || item.id) &&
            String(cartItem.specid || 0) === String(item.specid || 0)
          )
          if (idx > -1) {
            const nextNum = (Number(cartList[idx].cartNum) || 1) + nums
            if (nextNum <= 0) {
              cartList.splice(idx, 1)
            } else {
              cartList[idx].cartNum = nextNum
            }
            this.setData({
              cartList,
              cartCount: this.getCartCount(cartList),
              cartTotalPrice: this.getCartTotalPrice(cartList)
            })
          }
          this.getCartListByApi((cartList) => {
            if (!cartList.length) {
              this.hideCartPopup()
            }
          })
          return
        }
        wx.showToast({
          title: (res.data && res.data.msg) || '操作失败',
          icon: 'none'
        })
      }
    })
  },
  cartNumPlus(e) {
    const id = e.currentTarget.dataset.id
    const cartList = this.getCartFromStorage()
    const cartItem = cartList.find(item => String(item.id) === String(id))
    if (!cartItem) {
      return
    }
    this.updateCartNumByApi(cartItem, 1)
  },
  cartNumMinus(e) {
    const id = e.currentTarget.dataset.id
    const cartList = this.getCartFromStorage()
    const cartItem = cartList.find(item => String(item.id) === String(id))
    if (!cartItem) {
      return
    }
    this.updateCartNumByApi(cartItem, -1)
  },
  removeCartItem(e) {
    const cartRowId = Number(e.currentTarget.dataset.id) || 0
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    if (!cartRowId) {
      wx.showToast({
        title: '购物车ID无效',
        icon: 'none'
      })
      return
    }
    req({
      url: util.baseUrl + "/newapi/api/cart/delcartpro",
      method: "POST",
      data: {
        id: cartRowId,
        openid
      },
      success: res => {
        if (res.data && res.data.status) {
          this.getCartListByApi((cartList) => {
            if (!cartList.length) {
              this.hideCartPopup()
            }
          })
          return
        }
        wx.showToast({
          title: (res.data && res.data.msg) || '删除失败',
          icon: 'none'
        })
      }
    })
  },
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确认清空购物车吗？',
      success: res => {
        if (res.confirm) {
          const openid = wx.getStorageSync('openid')
          if (!openid) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            })
            return
          }
          req({
            url: util.baseUrl + "/newapi/api/cart/clearcart",
            method: "POST",
            data: {
              openid
            },
            success: ret => {
              if (ret.data && ret.data.status) {
                this.getCartListByApi((cartList) => {
                  if (!cartList.length) {
                    this.hideCartPopup()
                  }
                })
                return
              }
              wx.showToast({
                title: (ret.data && ret.data.msg) || '清空失败',
                icon: 'none'
              })
            },
            fail: () => {
              wx.showToast({
                title: '清空失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  goCartCheckout(e) {
    const id = e.currentTarget.dataset.id
    const cartList = this.getCartFromStorage()
    const item = cartList.find(cartItem => String(cartItem.id) === String(id))
    if (!item) {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      })
      return
    }
    let app = getApp();
    app.globalData.tc = item;
    wx.navigateTo({
      url: "/subpackagesC/gyyjiesuan/gyyjiesuan"
    })
  },
  checkoutCart() {
    const cartList = this.getCartFromStorage()
    if (!cartList.length) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }
    const app = getApp()
    app.globalData.cartCheckoutData = {
      cartList,
      from: 'gyyprolist'
    }
    wx.navigateTo({
      url: "/subpackagesC/gyyjiesuan/gyyjiesuan"
    })
  },
  rkaquan(e) {
    wx.myNavigateTo({
      url: "/pages/kaquan/kaquan?index=" + e.currentTarget.dataset.index
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
    this.initCart()
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
