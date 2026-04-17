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
    sex: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    this.setData({
      sex: options.sex
      // maxmoney: 1000
    })
    this.gettc()
    if (options.sex == 'nan') {
      this.gettjprodwzn()
    } else {
      this.gettjprodwzn()
    }
  },
  gettjprodwzn(){
    const tjData = wx.getStorageSync('tjData') || {}
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjprodwzwgy",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999,
        sex: tjData.sex || "",
        cardno: tjData.cardno || ""
      },
      success: res => {
        this.setData({
          xmList: res.data.data
        })
      }
    })
  },
  gettjprodwzv(){
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjprodwzv",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999
      },
      success: res => {
        this.setData({
          xmList: res.data.data
        })
      }
    })
  },
  getxm() {
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjprodwzs",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999
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
      url: util.baseUrl + "/newapi/api/tj/gettjprodwzs",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999
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
    let index = e.currentTarget.dataset.index;
    let moneySum = 0;
    let selectArr = [];
    let yuan = 0;
    let that = this;

    // xmList 仅允许单选
    let updatedXmList = this.data.xmList.map((item, idx) => {
      item.select = idx === index ? !item.select : false;
      return item;
    });
    this.setData({
      xmList: updatedXmList,
      sum: 0,
      yuanjia: 0
    });

    // 计算总价
    this.data.tcList.forEach(it => {
      if (it.select) {
        selectArr.push(it);
        moneySum += it.zkprice;
        yuan += it.orgprice;
      }
    });
    this.data.xmList.forEach(it => {
      if (it.select) {
        selectArr.push(it);
        moneySum += it.zkprice;
        yuan += it.orgprice;
      }
    });
    that.setData({
      sum: parseFloat(moneySum).toFixed(2),
      yuanjia: parseFloat(yuan),
      selectArrs: selectArr,
      personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : 0
    });
  },
  selectTcIitem(e) {
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
      // 计算套餐项目
      this.data.tcList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice;
          yuan += it.orgprice;
        }
      });
      
      // 计算个性化自选项目
      this.data.xmList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice;
          yuan += it.orgprice;
        }
      });

      that.setData({
        sum: parseFloat(moneySum).toFixed(2),
        yuanjia: parseFloat(yuan),
        selectArrs: selectArr,
        personmoney: parseFloat(moneySum) - parseFloat(this.data.maxmoney) > 0 ? (parseFloat(moneySum) - parseFloat(this.data.maxmoney)).toFixed(2) : 0
      });
    });
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
    // 验证套餐选择
    // const selectedTc = this.data.tcList.filter(item => item.select);
    // if (selectedTc.length === 0) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请选择一项套餐',
    //     showCancel: false
    //   });
    //   return;
    // }

    // 验证选择项目
    const selectedItems = this.data.xmList.filter(item => item.select);
    if (selectedItems.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请至少选择一项',
        showCancel: false
      });
      return;
    }
    
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
        corpmoney: this.data.maxmoney,
        personmoney: parseFloat(this.data.personmoney),
        ...tjData // 添加缓存的tjData数据
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/yuyue/yuyue?type=2',
            })
          }, 2000)
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel:false,
            complete: (res) => {
            }
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
