// subpackages/address/address.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')

function firstValue() {
  for (let index = 0; index < arguments.length; index += 1) {
    const value = arguments[index]
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim()
    }
  }
  return ''
}

function normalizeAddressRecord(item, index) {
  const source = item && typeof item === 'object' ? item : {}
  const name = firstValue(source.Name, source.name, source.receiverName, source.receiver)
  const mobile = firstValue(source.Mobile, source.mobile, source.phone, source.tel)
  const province = firstValue(source.Province, source.province)
  const city = firstValue(source.City, source.city)
  const county = firstValue(source.County, source.county, source.district)
  const address = firstValue(source.Address, source.address, source.detailAddress, source.detail)
  return Object.assign({}, source, {
    Name: name,
    Mobile: mobile,
    Province: province,
    City: city,
    County: county,
    Address: address,
    displayLabel: [name, mobile, `${province}${city}${county}${address}`].filter(Boolean).join(' '),
    historyKey: firstValue(source.id, source.Id, source.addressId) || `address_${index}_${name}_${mobile}`
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Name: "",
    Mobile: "",
    Province: "",
    City: "",
    County: "",
    Address: "",
    merchantOrderNo: "",
    region: ["浙江省", "温州市"],
    addressHistory: [],
    addressHistoryCount: 0,
    addressHistoryLoading: false,
    addressHistoryLoaded: false,
    selectedHistoryIndex: -1,
    selectedHistoryAddress: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadAddressHistory()
  },
  loadAddressHistory(retryCount) {
    const retry = Number.isFinite(Number(retryCount)) ? Number(retryCount) : 0
    const openid = wx.getStorageSync('openid') || ''
    if (!openid) {
      if (retry < 20) {
        this.setData({
          addressHistoryLoading: true,
          addressHistoryLoaded: false
        })
        clearTimeout(this._addressHistoryRetryTimer)
        this._addressHistoryRetryTimer = setTimeout(() => {
          this.loadAddressHistory(retry + 1)
        }, 250)
        return
      }
      this.setData({
        addressHistory: [],
        addressHistoryCount: 0,
        addressHistoryLoading: false,
        addressHistoryLoaded: true
      })
      return
    }
    clearTimeout(this._addressHistoryRetryTimer)
    this.setData({
      addressHistoryLoading: true
    })
    req({
      url: util.baseUrl + "/newapi/api/sf/addresshistory",
      method: "POST",
      data: {
        Openid: openid
      },
      success: res => {
        const payload = res && res.data && typeof res.data === 'object' ? res.data : {}
        const list = Array.isArray(payload.data)
          ? payload.data.map(normalizeAddressRecord).filter(item => item.Name || item.Mobile || item.Address)
          : []
        const count = Number(payload.msg)
        this.setData({
          addressHistory: list,
          addressHistoryCount: Number.isFinite(count) && count >= 0 ? count : list.length,
          addressHistoryLoading: false,
          addressHistoryLoaded: true,
          selectedHistoryIndex: -1,
          selectedHistoryAddress: null
        })
      },
      fail: err => {
        console.warn('[address] load history failed:', err)
        this.setData({
          addressHistory: [],
          addressHistoryCount: 0,
          addressHistoryLoading: false,
          addressHistoryLoaded: true
        })
      }
    })
  },
  selectHistoryAddress(e) {
    const index = Number(e.detail && e.detail.value !== undefined
      ? e.detail.value
      : e.currentTarget.dataset.index)
    const item = this.data.addressHistory[index]
    if (!item) {
      return
    }
    const nextData = {
      Name: item.Name,
      Mobile: item.Mobile,
      Province: item.Province,
      City: item.City,
      County: item.County,
      Address: item.Address,
      selectedHistoryIndex: index,
      selectedHistoryAddress: item
    }
    if (item.Province && item.City && item.County) {
      nextData.region = [item.Province, item.City, item.County]
    }
    this.setData(nextData)
    wx.showToast({
      title: '已填入历史地址',
      icon: 'success'
    })
  },
  bindRegionChange(e) {
    let value = e.detail.value
    this.setData({
      Province: value[0],
      City: value[1],
      County: value[2],
      region: value
    })
    console.log('picker发送选择改变，携带值为', e.detail.value)
  },
  submit() {
    if (!this.data.Name) {
      wx.showToast({
        title: '请填写收货人',
      })
      return;
    } else if (this.data.Mobile.length !== 11) {
      wx.showToast({
        title: '手机号为11位',
      })
      return;
    } else if (!this.data.Province && !this.data.City && !this.data.County) {
      wx.showToast({
        title: '请选择省市区',
      })
      return;
    } else if (!this.data.Address) {
      wx.showToast({
        title: '请填写详细地址',
      })
      return;
    } else if (!this.data.merchantOrderNo) {
      wx.showToast({
        title: '请填写体检号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/sf/insertaddress",
      method: "POST",
      data: {
        Openid: wx.getStorageSync('openid'),
        Name: this.data.Name,
        Mobile: this.data.Mobile,
        Province: this.data.Province,
        City: this.data.City,
        County: this.data.County,
        Address: this.data.Address,
        merchantOrderNo: this.data.merchantOrderNo
      },
      success: res => {
        if (res.data.status) {
          this.loadAddressHistory()
          wx.showModal({
            title: '提示',
            content: '提交成功',
            showCancel: false
          })
        } else {
          wx.showToast({
            title: '提交失败',
          })
        }
      }
    })
  },
  saoyisao() {
    wx.scanCode({
      success: res => {
        console.log(res)
        if (res.errMsg === 'scanCode:ok') {
          if (res.result.length !== 10) {
            wx.showToast({
              title: '条码错误请重试',
            })
            return;
          }
          this.setData({
            merchantOrderNo: (this.data.merchantOrderNo ? this.data.merchantOrderNo + "," : "") + res.result
          })
        }
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
    if (this.data.addressHistoryLoaded) {
      this.loadAddressHistory()
    }
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
    clearTimeout(this._addressHistoryRetryTimer)
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
