// pages/ArrangeTime/ArrangeTime.js
const util = require('../../utils/util')
const moment = require('../../utils/moment')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: "",
    selectTime: "",
    doctor: {

    },
    haoyuan: [],
    timeList: [],
    pbxxs: {},
    xh: "",
    selectRq: "",
    options: {

    },
    newTimeList: [],
    currentBr: null,
    addqinqing: false,
    brxm: "",
    sfzh: "",
    yddh: ""
  },
  showTime(e) {
    let data = e.currentTarget.dataset;
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getysdetail3',
      method: "POST",
      data: {
        KSBM: data.row.Ksbm,
        PBLSH: String(data.row.Lsh),
        DATE: data.rq
      },
      success: res => {
        this.setData({
          timeList: res.data.pbxxs[0].XHLB,
          pbxxs: res.data.pbxxs[0]
        }, () => {
          // this.utcChangeLocal(this.data.timeList)
        })
        if (this.data.selectIndex === data.idx) {
          // this.setData({
          //   selectIndex:"",
          //   selectTime:""
          // })
        } else {
          this.setData({
            selectIndex: data.idx,
            selectTime: ""
          })
        }
      }
    })
  },
  gbadd() {
    this.setData({
      addqinqing: false
    })
  },
  utcChangeLocal(arr) {
    let newarr = []
    arr.forEach(item => {
      let utc = item.utctime * 1000;
      const fmt = 'YYYY-MM-DD HH:mm:ss'
      let time = moment(utc).utc().local().format(fmt);
      newarr.push({
        ...item,
        time: time
      })
    })
    this.setData({
      newTimeList: newarr
    })
    console.log(this.data.newTimeList)
  },
  selectTime(e) {
    let data = e.currentTarget.dataset
    if (data.utctime == 1) {
      return;
    }
    this.setData({
      selectTime: data.time,
      xh: data.xh,
      selectRq: data.rq
    })
  },
  changephone(e) {
    let phone = e.detail.value
    phone = phone.replace(/\s*/g, "");

    this.setData({
      yddh: phone
    })
  },
  qqsubmit() {
    if (!this.data.brxm) {
      wx.showToast({
        title: '请填写姓名',
      })
      return;
    } else if (!this.data.sfzh) {
      wx.showToast({
        title: '请填写身份证',
      })
      return;
    } else if (this.data.yddh.length !== 11) {
      wx.showToast({
        title: '手机号为11位',
      })
      return;
    }
    let haoyuanInfo = this.data.haoyuan[this.data.selectIndex];
    let params = {
      YYLSH: "0",
      PBLSH: haoyuanInfo.Lsh,
      YYXH: this.data.xh,
      YYSJ: this.data.selectRq,
      BRXM: this.data.brxm,
      SJHM: this.data.yddh,
      BRDZ: "",
      SFZH: this.data.sfzh,
      BRLY: "QYY",
      source: wx.getStorageSync('sponsor')
    }
    wx.showModal({
      title: '预约信息',
      content: '就诊人:' + this.data.brxm + ';就诊时间 ' + this.data.selectRq + ';是否预约？',
      complete: (res) => {
        if (res.confirm) {
          req({
            url: util.baseUrl + '/newapi/api/mzyy/addyyxx',
            data: params,
            method: 'POST',
            success: res => {
              if (res.data.status) {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: false,
                  complete: (res) => {
                    if (res.confirm) {
                      wx.navigateTo({
                        url: '../yuyue/yuyue',
                      })
                    }
                  }
                })
                // this.setData({
                //   addqinqing:false
                // })

              }
              this.gethaoyuan()
              this.bindyyinfo()
            }
          })
        }
      }
    })
  },
  bindyyinfo() {
    req({
      url: util.baseUrl + "/newapi/api/yyda/bindyyinfo",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        brxm: this.data.brxm,
        yddh: this.data.yddh,
        sfzh: this.data.sfzh
      },
      success: res => {
        this.gettopyyinfo()
      }
    })
  },
  submit() {
    let userInfo = wx.getStorageSync('realInfo');
    let haoyuanInfo = this.data.haoyuan[this.data.selectIndex];
    if (!this.data.currentBr) {
      wx.showToast({
        title: '请添加就诊人',
      })
      this.setData({
        addqinqing: true
      })
      return;
    }
    // wx.request({
    //   url: util.baseUrl+'/newapi/api/mzyy/addyyxx',
    // })
    let params = {
      YYLSH: "0",
      PBLSH: haoyuanInfo.Lsh,
      YYXH: this.data.xh,
      YYSJ: this.data.selectRq,
      BRXM: this.data.currentBr.brxm,
      SJHM: this.data.currentBr.yddh,
      BRDZ: "",
      SFZH: this.data.currentBr.sfzh,
      BRLY: "QYY",
      source: wx.getStorageSync('sponsor')
    }
    if (!wx.getStorageSync('userInfo')) {
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../login/login',
            })
          }, 1000)
        }
      })
      return;
    }

    if (this.data.selectTime) {
      if (!util.realExist()) {
        wx.showModal({
          title: '提示',
          content: '请填写真实信息后预约',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../realInfo/readlInfo'
              })
            }
          }
        })
        return;
      }
      wx.showModal({
        title: '预约信息',
        content: '就诊人:' + this.data.currentBr.brxm + ';就诊时间 ' + this.data.selectRq + ';是否预约？',
        complete: (res) => {
          if (res.cancel) {

          }

          if (res.confirm) {
            req({
              url: util.baseUrl + '/newapi/api/mzyy/addyyxx',
              data: params,
              method: 'POST',
              success: res => {
                wx.showModal({
                  title: '提示',
                  content: res.data.data,
                  showCancel: false
                })
                this.gethaoyuan()
              }
            })
          }
        }
      })


    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    this.setData({
      options: options
    })
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getysjjysbm',
      data: {
        ysbm: options.ygdm
      },
      success: res => {
        this.setData({
          doctor: res.data[0]
        })
      }
    })
    this.gethaoyuan();
  },
  gettopyyinfo() {
    req({
      url: util.baseUrl + "/newapi/api/yyda/topyyinfo",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            currentBr: res.data.data[0]
          })
        }
      }
    })
  },
  rqqlist() {
    wx.myNavigateTo({
      url: '../../subpackages/qinqinglist/qinqinglist',
    })
  },
  gethaoyuan() {
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getpbxxlistwithysbm',
      data: {
        ysbm: this.data.options.ygdm
      },
      success: res => {
        this.setData({
          haoyuan: res.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.gettopyyinfo()
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