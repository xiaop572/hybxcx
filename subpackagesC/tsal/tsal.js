// subpackages/tsal/tsal.js
const util = require("../../utils/util");
const {
  req
} = require("../../utils/request");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    caseList: [],
    currentTab: 0,
    tabs: [],
    typeid: null,
    typeids: [],
    caseTypeList: [] // 存储从接口获取的分类数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    // 先获取分类数据
    this.getCaseType(() => {
      if (options.typeid) {
        // 根据typeid找到对应的tab索引
        const index = this.data.typeids.findIndex(id => id == options.typeid);
        this.setData({
          typeid: options.typeid,
          currentTab: index !== -1 ? index : 0
        }, () => {
          this.getCaseList()
        })
      } else {
        // 默认加载第一个tab的数据
        if (this.data.typeids.length > 0) {
          this.setData({
            typeid: this.data.typeids[0]
          }, () => {
            this.getCaseList()
          })
        }
      }
    })
  },

  /**
   * 获取特色分类
   */
  getCaseType(callback) {
    req({
      url: util.baseUrl + "/newapi/api/cms/getcasetype",
      method: "POST",
      data: {
        classid: 0
      },
      success: (res) => {
        if (res.data && res.data.data) {
          const caseTypeList = res.data.data;
          const tabs = caseTypeList.map(item => item.typename || item.name);
          const typeids = caseTypeList.map(item => item.id || item.typeid);
          
          this.setData({
            caseTypeList: caseTypeList,
            tabs: tabs,
            typeids: typeids
          }, () => {
            if (callback) callback();
          })
        } else {
          // 如果接口失败，使用默认数据
          this.setData({
            tabs: ['整形中心', '形体中心', '微整中心', '皮肤美容'],
            typeids: [6, 9, 7, 8]
          }, () => {
            if (callback) callback();
          })
        }
      },
      fail: () => {
        // 接口调用失败时使用默认数据
        this.setData({
          tabs: ['整形中心', '形体中心', '微整中心', '皮肤美容'],
          typeids: [6, 9, 7, 8]
        }, () => {
          if (callback) callback();
        })
      }
    })
  },

  /**
   * 获取案例列表
   */
  getCaseList() {
    req({
      url: util.baseUrl + "/newapi/api/cms/allcase",
      method: "POST",
      data: {
        "curpage": 1,
        "limit": 99999,
        "typeid": this.data.typeid,
        "searchkey": ""
      },
      success: (res) => {
        this.setData({
          caseList: res.data.data
        })
      }
    })
  },

  /**
   * 切换导航标签
   */
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    const typeid = this.data.typeids[index];
    this.setData({
      currentTab: index,
      typeid: typeid
    }, () => {
      this.getCaseList()
    })
  },

  /**
   * 向左滚动导航
   */
  scrollLeft() {
    const currentTab = this.data.currentTab;
    if (currentTab > 0) {
      this.switchTab({
        currentTarget: {
          dataset: {
            index: currentTab - 1
          }
        }
      })
    }
  },

  /**
   * 向右滚动导航
   */
  scrollRight() {
    const currentTab = this.data.currentTab;
    if (currentTab < this.data.tabs.length - 1) {
      this.switchTab({
        currentTarget: {
          dataset: {
            index: currentTab + 1
          }
        }
      })
    }
  },

  /**
   * 导航到详情页
   */
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/subpackagesC/newsdetail/newsdetail?id=${id}`
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
    this.getCaseList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
})