// pages/jiaxiang/jiiaxiang.js
var app = getApp()
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tcList: [],
    xmList: [],
    sum: 0,
    selectArrs: [],
    explainContent: "",
    explainShow: false,
    yuanjia: 0,
    maxmoney: 0,
    personmoney: 0,
    dxvis: true,
    tjtype: "",
    year: -1,
    hasSelectedTcWithIfcheck: false,
    sex:"",
    tjData:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const tjData = wx.getStorageSync('tjData');
    this.setData({
      maxmoney: parseFloat(app.globalData.tjyy.unitMoney),
      tjtype: options.tjtype,
      year: options.year,
      sex:options.sex,
      tjData
      // maxmoney: 1000
    })
    this.getxm()
    this.gettc()
  },
  getxm() {
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjprodzg",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999,
        sex:this.data.sex,
        cardno:this.data.tjData.cardno
      },
      success: res => {
        this.setData({
          xmList: res.data.data
        })
      }
    })
  },
  gettc() {
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjprodzgt",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999,
        sex:this.data.sex,
        cardno:this.data.tjData.cardno
      },
      success: res => {
        this.setData({
          tcList: res.data.data
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
    // 检查是否已选择套餐
    let hasSelectedTc = false;
    let canSelectItems = false;

    if (this.data.selectArrs && this.data.selectArrs.length > 0) {
      // 遍历已选择的项目，查找来自tcList的套餐
      this.data.selectArrs.forEach(item => {
        // 检查是否是套餐项目（来自tcList）
        let isTcItem = this.data.tcList.some(tc => tc.id === item.id);
        if (isTcItem) {
          hasSelectedTc = true;
          if (item.ifcheck === 1) {
            canSelectItems = true;
          }
        }
      });
    }

    if (!hasSelectedTc) {
      wx.showModal({
        title: '提示',
        content: '请先选择套餐',
        showCancel: false
      });
      return;
    }

    if (!canSelectItems) {
      wx.showModal({
        title: '提示',
        content: '当前套餐不支持选择加项',
        showCancel: false
      });
      return;
    }

    let index = e.currentTarget.dataset.index;
    let data = this.data.xmList[index];

    // 检查年龄限制和已选择的加项数量
    if (!this.data.xmList[index].select) {
      // 如果是要选择加项，检查数量限制
      let selectedItemsCount = this.data.xmList.filter(item => item.select).length;
      let maxItems = this.data.year >= 45 ? 4 : 3;

      if (selectedItemsCount >= maxItems) {
        wx.showModal({
          title: '提示',
          content: `最多只能选择${maxItems}个加项`,
          showCancel: false
        });
        return;
      }
    }

    let moneySum = 0;
    let choseChange = "xmList[" + index + "].select"
    let selectArr = [];
    let yuan = 0;
    let that = this;
    this.setData({
      [choseChange]: !this.data.xmList[index].select,
      sum: 0,
      yuanjia: 0
    }, () => {
      this.data.tcList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      this.data.xmList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })

      that.setData({
        sum: parseFloat(moneySum).toFixed(2),
        yuanjia: parseFloat(yuan),
        selectArrs: selectArr,
        personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : 0
      })
    })
  },
  selectTcIitem(e) {
    // 检查是否有已选择的加项，如果有则直接清除
    let hasSelectedItems = this.data.xmList.some(item => item.select);
    if (hasSelectedItems) {
      // 直接清除所有加项选择
      let updatedXmList = this.data.xmList.map(item => {
        item.select = false;
        return item;
      });
      this.setData({
        xmList: updatedXmList
      });
    }

    let state = this.isSeltcItem()
    if (!state) {
      return;
    }
    let index = e.currentTarget.dataset.index;
    let moneySum = 0;
    let selectArr = [];
    let yuan = 0;
    let that = this;

    // 先将所有项目的select设为false
    let updatedTcList = this.data.tcList.map((item, idx) => {
      item.select = idx === index ? !item.select : false;
      return item;
    });

    this.setData({
      tcList: updatedTcList,
      sum: 0,
      yuanjia: 0
    }, () => {
      // 检查选中的套餐是否支持单项选择
      let selectedTc = that.data.tcList.find(tc => tc.select);
      let hasSelectedTcWithIfcheck = false;
      
      if (selectedTc) {
        // 如果选择了套餐，检查ifcheck值
        hasSelectedTcWithIfcheck = selectedTc.ifcheck === 1;
      }
      
      // 更新hasSelectedTcWithIfcheck状态
      that.setData({
        hasSelectedTcWithIfcheck: hasSelectedTcWithIfcheck
      });
      
      if (selectedTc && selectedTc.ifcheck === 0) {
        // 清除所有单项选择
        let updatedXmList = that.data.xmList.map(item => {
          item.select = false;
          return item;
        });
        that.setData({
          xmList: updatedXmList
        });
      }

      // 计算套餐项目
      this.data.tcList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      // 计算个性化自选项目
      this.data.xmList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      that.setData({
        sum: parseFloat(moneySum).toFixed(2),
        yuanjia: parseFloat(yuan),
        selectArrs: selectArr,
        personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : 0
      })
    })
  },
  isSelItem() {
    let state = true;
    this.data.tcList.forEach(it => {
      if (it.select) {
        wx.showModal({
          title: '提示',
          content: '套餐不能与单项同时选择',
          showCancel: false
        })
        state = false;
      }
    })
    return state;
  },
  isSeltcItem() {
    let state = true;
    this.data.xmList.forEach(it => {
      if (it.select) {
        wx.showModal({
          title: '提示',
          content: '套餐不能与单项同时选择',
          showCancel: false
        })
        state = false;
      }
    })
    return state;
  },
  payment() {
    // 检查选择了支持加项的套餐时，加项数量是否达到要求
    let selectedTc = null;
    let selectedItemsCount = 0;

    // 统计已选择的套餐和加项
    this.data.selectArrs.forEach(item => {
      let isTcItem = this.data.tcList.some(tc => tc.id === item.id);
      if (isTcItem) {
        selectedTc = item;
      } else {
        selectedItemsCount++;
      }
    });

    // 如果选择了支持加项的套餐，检查加项数量
    if (selectedTc && selectedTc.ifcheck === 1) {
      let minItems = this.data.year >= 45 ? 4 : 3;
      if (selectedItemsCount < minItems) {
        wx.showModal({
          title: '提示',
          content: `当前套餐需要选择${minItems}个加项，您只选择了${selectedItemsCount}个`,
          showCancel: false
        });
        return;
      }
    }

    // if (this.data.selectArrs.length === 0) {
    //   wx.showToast({
    //     title: '请选择加项'
    //   })
    //   return;
    // }
    // 获取缓存的tjData数据
    const tjData = wx.getStorageSync('tjData');

    // 检查是否有预约信息
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
        corpmoney: 0,
        personmoney: parseFloat(this.data.sum),
        ...tjData
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../../pages/index/index',
            })
          }, 2000)
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            complete: (res) => {}
          })
        }
      }
    })
  },
  close() {
    console.log(this.data.explainShow)
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