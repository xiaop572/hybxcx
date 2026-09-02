const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')

const WZLT_QUOTA_MAP = {
  marriedFemale40Up: {
    label: '1+X',
    desc: '已婚女性（40周岁及以上）',
    money: 760
  },
  marriedFemaleUnder40: {
    label: '1+X',
    desc: '已婚女性（40周岁以下）',
    money: 434
  },
  unmarriedFemale: {
    label: '1+X',
    desc: '未婚女性',
    money: 404
  },
  male45Up: {
    label: '1+X',
    desc: '男性（45周岁及以上）',
    money: 695
  },
  maleUnder45: {
    label: '1+X',
    desc: '男性（45周岁以下）',
    money: 419
  }
}

function calculateAge(idCard) {
  if (!idCard || String(idCard).length !== 18) {
    return 0
  }
  const value = String(idCard)
  const birthYear = parseInt(value.substring(6, 10), 10)
  const birthMonth = parseInt(value.substring(10, 12), 10)
  const birthDay = parseInt(value.substring(12, 14), 10)
  if (!birthYear || !birthMonth || !birthDay) {
    return 0
  }
  const currentDate = new Date()
  let age = currentDate.getFullYear() - birthYear
  const currentMonth = currentDate.getMonth() + 1
  const currentDay = currentDate.getDate()
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--
  }
  return age
}

function getQuotaInfo(tjData) {
  const data = tjData || {}
  const sex = data.sex || ''
  const marry = data.marry || ''
  const age = calculateAge(data.cardno)
  if (sex === '男') {
    const quota = age >= 45 ? WZLT_QUOTA_MAP.male45Up : WZLT_QUOTA_MAP.maleUnder45
    return Object.assign({
      age
    }, quota)
  }
  if (marry === '未婚') {
    return Object.assign({
      age
    }, WZLT_QUOTA_MAP.unmarriedFemale)
  }
  const quota = age >= 40 ? WZLT_QUOTA_MAP.marriedFemale40Up : WZLT_QUOTA_MAP.marriedFemaleUnder40
  return Object.assign({
    age
  }, quota)
}

Page({
  data: {
    xmList: [],
    sum: '0.00',
    selectArrs: [],
    explainContent: "",
    explainShow: false,
    yuanjia: 0,
    maxmoney: 0,
    personmoney: '0.00',
    dxvis: true,
    sex: "",
    quotaLabel: "",
    quotaDesc: "",
    age: 0,
    loading: false
  },

  onLoad(options) {
    const tjData = wx.getStorageSync('tjData') || {}
    const quotaInfo = getQuotaInfo(tjData)
    this.setData({
      sex: options.sex || tjData.sex || "",
      maxmoney: quotaInfo.money,
      quotaLabel: quotaInfo.label,
      quotaDesc: quotaInfo.desc,
      age: quotaInfo.age
    })
    this.getProjectList()
  },

  getProjectList() {
    const tjData = wx.getStorageSync('tjData') || {}
    this.setData({
      loading: true
    })
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjprodwzlt",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999,
        sex: tjData.sex || this.data.sex,
        cardno: tjData.cardno || ""
      },
      success: res => {
        this.setData({
          xmList: res.data.data || [],
          loading: false
        })
      },
      fail: () => {
        this.setData({
          loading: false
        })
        wx.showToast({
          title: '项目加载失败',
          icon: 'none'
        })
      }
    })
  },

  changedxvis() {
    this.setData({
      dxvis: !this.data.dxvis
    })
  },

  selectItem(e) {
    let index = Number(e.currentTarget.dataset.index);
    let moneySum = 0;
    let selectArr = [];
    let yuan = 0;

    let updatedXmList = this.data.xmList.map((item, idx) => {
      item.select = idx === index ? !item.select : item.select;
      return item;
    });

    updatedXmList.forEach(it => {
      if (it.select) {
        selectArr.push(it);
        moneySum += Number(it.zkprice || 0);
        yuan += Number(it.orgprice || 0);
      }
    });

    this.setData({
      xmList: updatedXmList,
      sum: parseFloat(moneySum).toFixed(2),
      yuanjia: parseFloat(yuan),
      selectArrs: selectArr,
      personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : '0.00'
    });
  },

  payment() {
    const selectedItems = this.data.xmList.filter(item => item.select);
    if (selectedItems.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请至少选择一项',
        showCancel: false
      });
      return;
    }

    const tjData = wx.getStorageSync('tjData');
    if (!tjData || Object.keys(tjData).length === 0) {
      wx.showToast({
        title: '没有预约信息',
        icon: 'none',
        duration: 1500
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/danweitijian/danweitijian'
        });
      }, 1500);
      return;
    }

    req({
      url: util.baseUrl + "/newapi/api/yuyue/tjtijianwenda",
      method: "POST",
      data: {
        dataList: this.data.selectArrs,
        tjid: 0,
        openid: wx.getStorageSync('openid'),
        allmoney: parseFloat(this.data.sum),
        corpmoney: this.data.maxmoney,
        personmoney: parseFloat(this.data.personmoney),
        ...tjData
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          wx.removeStorageSync('tjData')
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/yuyue/yuyue?type=2',
            })
          }, 2000)
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false
          })
        }
      }
    })
  },

  close() {
    this.setData({
      explainShow: !this.data.explainShow
    })
  },

  showExplain(e) {
    this.setData({
      explainContent: e.currentTarget.dataset.exp,
      explainShow: !this.data.explainShow
    })
  },

  noclose() {},

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})
