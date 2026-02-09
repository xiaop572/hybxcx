// subpackagesB/hylist/hylist.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jblist: [],
    searchText: '',
    searchResults: [],
    mockData: ['选项1', '选项2', '选项3', '苹果', '香蕉', '橙子'], // 模拟数据 
    mobile: "",
    show: false,
    id: "",
    name: "",
  },
  handleInput: function (e) {
    const searchText = e.detail.value;
    this.search(searchText);
  },
  search: function (searchText) {
    if (!searchText) {
      this.setData({
        searchResults: []
      });
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabinlist",
      method: "POST",
      data: {
        "curpage": 1,
        "searchkey": searchText,
        "limit": 999
      },
      success: res => {
        this.setData({
          searchResults: res.data.data
        });
      }
    })
  },
  selectItem: function (e) {
    const selectedItem = e.currentTarget.dataset.item;
    // 这里可以处理选中项的逻辑，比如设置到input的值  
    wx.showToast({
      title: '选中：' + selectedItem,
      icon: 'success',
      duration: 2000
    });
    // 清空搜索结果，如果需要的话  
    this.setData({
      searchResults: []
    });
  },
  guanbi() {
    this.setData({
      show: false
    })
  },
  setmobile(e) {
    let data = e.currentTarget.dataset;
    this.setData({
      show: true,
      id: data.id,
      name: data.name
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.gethclist()
  },
  gethclist(keys) {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/getjiabinlist",
      method: "POST",
      data: {
        "curpage": 1,
        "searchkey": "",
        "limit": 999
      },
      success: res => {
        this.setData({
          jblist: res.data.data
        })
      }
    })
  },
  rjbinfo(e) {
    let data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../xingcheng/xingcheng?id=' + data.id,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  fdx(e) {
    let data = this.data;
    wx.showModal({
      title: '提示',
      content: '是否发送短信给' + data.name,
      complete: (res) => {
        if (res.confirm) {
          req({
            url: util.baseUrl + "/newapi/api/yinxiang/urllink",
            method: "POST",
            data: {
              url: '/subpackagesB/xingcheng/xingcheng',
              query: 'id=' + data.id,
              typeid: 0
            },
            success: res => {
              req({
                url: util.baseUrl + "/newapi/api/huiwu/sendhwxcifno",
                method: "post",
                data: {
                  id: String(data.id),
                  name: data.name,
                  url: res.data.data,
                  mobile: this.data.mobile
                },
                success: res => {
                  if (res.data.status) {
                    wx.showToast({
                      title: res.data.msg,
                    })
                    this.setData({
                      mobile: "",
                      id: "",
                      name: "",
                      show:false
                    })
                    return;
                  } else {
                    wx.showToast({
                      title: res.data.msg,
                    })
                    return;
                  }
                }
              })
            }
          })
        }
      }
    })

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