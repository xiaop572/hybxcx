// pages/reportContent/reportContent.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tijianInfo: {},
    idx: 0,
    zhujianShow: false,
    zhujianList: [],
    danxiangList: [],
    reportgroupnamecustom: [],
    dialogShow: false,
    openid: "",
    aizdmsg: "",
    aifxstatus: false,
    aifxtext: '',
    aifxtextStatus: false,
    noneStatus: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tijianInfo: wx.getStorageSync('tijian')[options.idx],
      idx: parseInt(options.idx) + 1,
      openid: wx.getStorageSync('openid')
    })
    let arr = []
    this.data.tijianInfo.advice.split('*').forEach((item, index) => {
      let trim = item.trim();
      if (trim !== "") {
        arr.push(trim)
      }
    })
    this.setData({
      zhujianList: arr
    })
    //单项目结果颜色
    this.setItemColor()
    //单项结果
    let test = ""
    this.data.tijianInfo.reportgroupnamecustom.forEach(item => {
      item.show = false
    })
    this.setData({
      reportgroupnamecustom: this.data.tijianInfo.reportgroupnamecustom
    })

  },
  setItemColor() {
    if (typeof this.data.tijianInfo !== 'object' || !this.data.reportgroupnamecustom || !this.data.reportgroupnamecustom.length === 0) {
      return;
    }
    let data = this.data.tijianInfo.reportgroupnamecustom;
    data.forEach(item => {
      if (!item.reportitemnamecustom || item.reportitemnamecustom.length <= 0) {
        return;
      }
      item.reportitemnamecustom.forEach(it => {
        if (it.referencerange) {
          let cankaoArr = null
          if (it.referencerange.indexOf('～') >= 0) {
            cankaoArr = it.referencerange.split("～");
          } else {
            cankaoArr = it.referencerange.split("-");
          }
          console.log(it.referencerange, it.firstresult, it.itemname)
          let length = cankaoArr.length;
          switch (length) {
            case 2:
              if (parseFloat(it.firstresult) < parseFloat(cankaoArr[0])) {
                it.color = "blue"
              } else if (parseFloat(it.firstresult) > parseFloat(cankaoArr[1])) {
                it.color = "red"
              }
              break;
            case 1:
              if (it.referencerange.indexOf('<') >= 0) {
                let reg = /</;
                let canshu = it.referencerange.replace(reg, "");
                if (it.firstresult > canshu) {
                  it.color = "red"
                }
              } else if (it.referencerange.indexOf('>') >= 0) {
                let reg = />/;
                let canshu = it.referencerange.replace(reg, "");
                if (it.firstresult < canshu) {
                  it.color = "blue"
                }
              } else {
                if (it.referencerange.trim() !== it.firstresult) {
                  it.color = "red"
                }
              }
              break;
            default:
              break;
          }
        }
      })
    })
  },

  hideDialog() {
    this.setData({
      dialogShow: false
    })
  },

  aifx() {
    wx.showLoading({
      title: 'AI分析中...',
    })
    req({
      url: util.baseUrl + "/newapi/api/Volc/physicalReportAnalyze",
      method: "post",
      data: {
        name: this.data.tijianInfo.name,
        mobile: wx.getStorageSync('realInfo').mobile,
        cardNo: wx.getStorageSync('realInfo').cardno,
        serialNo: this.data.tijianInfo.serialno,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        const apiData = res.data.data
        let formattedData = apiData;
        if (typeof apiData !== 'string') {
          try {
            formattedData = JSON.stringify(apiData, null, 2);
          } catch (e) {
            formattedData = String(apiData);
          }
        }

        // 过滤掉#和*字符
        formattedData = formattedData.replace(/[#*]/g, '')

        // 跳转到AI分析结果页面
        wx.navigateTo({
          url: '/subpackagesC/aifx/aifx?aifxtext=' + encodeURIComponent(formattedData) +
            '&name=' + encodeURIComponent(this.data.tijianInfo.name) +
            '&serialno=' + encodeURIComponent(this.data.tijianInfo.serialno) +
            '&myDate=' + encodeURIComponent(this.data.tijianInfo.myDate),
          complete: () => {
            wx.hideLoading();
          }
        })
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'none'
        })
      }
    })
  },
  zjShow() {
    this.setData({
      zhujianShow: !this.data.zhujianShow
    })
  },
  itemShow(e) {
    let index = e.currentTarget.dataset.index
    let arr = this.data.reportgroupnamecustom;
    arr[index].show = !arr[index].show;
    this.setData({
      reportgroupnamecustom: [
        ...arr,
      ]
    })
  },

  processApiData(data) {
    let formattedData = data;
    if (typeof data !== 'string') {
      try {
        formattedData = JSON.stringify(data, null, 2);
      } catch (e) {
        formattedData = String(data);
      }
    }

    // 过滤掉#和*字符
    formattedData = formattedData.replace(/[#*]/g, '')

    this.setData({
      aifxtextStatus: true,
      aifxtext: formattedData
    });
  },
  closeaifx() {
    this.setData({
      aifxstatus: false
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})