// pages/danweitijian/danweitijian.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['已婚', '未婚'],
    sexList: ['男', '女'],
    hunyin: "",
    timeList: [],
    time: "",
    sex: "",
    xinmin: "",
    mobile: "",
    cardno: "",
    corp: "",
    fromsource: "",
    openid: "",
    ptype: 19,
    age: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
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
    console.log(app)
  },
  getTime() {
    req({
      url: util.baseUrl + "/newapi/api/mindex/tjdate",
      method: "GET",
      data: {
        classid: 1,
        classname:this.data.corp
      },
      success: (res) => {
        this.setData({
          timeList: res.data.data
        })
      }
    })
  },
  getTime2() {
    req({
      url: util.baseUrl + "/newapi/api/mindex/tjdate2",
      method: "GET",
      data: {
        classid: 1,
        classname:this.data.corp
      },
      success: (res) => {
        this.setData({
          timeList: res.data.data
        })
      }
    })
  },
  bindTimeChange(e) {
    this.setData({
      time: this.data.timeList[e.detail.value]['sdate']
    })
  },
  bindsexchange(e) {
    this.setData({
      sex: this.data.sexList[e.detail.value]
    })
  },
  inputXmCardno(e) {
    req({
      url: util.baseUrl + "/newapi/api/tj/getcorptjstatus",
      method: "POST",
      data: {
        xinmin: e.detail.value,
        mobile: "",
        cardno: ""
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            corp: res.data.data.corp
          })
          if (res.data.data.corp === '温州育英实验学校') {
            this.getTime2()
          } else {
            this.getTime()
          }
        }
      }
    })
  },
  inputCardno(e) {
    this.setData({
      cardno: e.detail.value
    })
    
    if (e.detail.value.length === 18) {
      req({
        url: util.baseUrl + "/newapi/api/tj/getcorptjstatus",
        method: "POST",
        data: {
          cardno: e.detail.value,
          mobile: "",
          xinmin: ""
        },
        success: res => {
          if (res.data.status) {
            this.setData({
              corp: res.data.data.corp
            })
            
            // 如果是中国银行，根据身份证计算年龄
            if (res.data.data.corp === '中国银行') {
              let age = this.calculateAge(e.detail.value);
              this.setData({
                age: age
              })
            }
            
            if (res.data.data.corp === '温州育英实验学校') {
              this.getTime2()
            } else {
              this.getTime()
            }
          }
          // else {
          //   this.setData({
          //     corp: ""
          //   })
          //   wx.showModal({
          //     showCancel: false,
          //     title: "提示",
          //     content: "你的信息未登记，请核实再进行预约"
          //   })
          // }
        }
      })
      console.log(e.detail.value)
    }
  },
  bindhunchange(e) {
    this.setData({
      hunyin: this.data.array[e.detail.value]
    })
  },
  // 根据身份证号码计算年龄
  calculateAge(idCard) {
    if (!idCard || idCard.length !== 18) {
      return 0;
    }
    
    // 从身份证号码中提取出生年月日
    let birthYear = parseInt(idCard.substring(6, 10));
    let birthMonth = parseInt(idCard.substring(10, 12));
    let birthDay = parseInt(idCard.substring(12, 14));
    
    // 获取当前日期
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();
    
    // 计算年龄
    let age = currentYear - birthYear;
    
    // 如果当前月份小于出生月份，或者当前月份等于出生月份但当前日期小于出生日期，则年龄减1
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    
    return age;
  },
  rtijiao() {
    let that=this;
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名!',
      })
      return;
    } else if (!this.data.mobile) {
      wx.showToast({
        title: '请填写手机号!',
      })
      return;
    } else if (!this.data.sex) {
      wx.showToast({
        title: '请选择性别!',
      })
      return;
    } else if (!this.data.cardno) {
      wx.showToast({
        title: '请填写身份证号!',
      })
      return;
    } else if (this.data.cardno.length !== 18) {
      wx.showToast({
        title: '身份证为18位!',
      })
      return;
    } else if (!this.data.hunyin) {
      wx.showToast({
        title: '请选择婚姻!',
      })
      return;
    } else if (!this.data.time) {
      wx.showToast({
        title: '请选择时间!',
      })
      return;
    }
    if (!this.data.corp) {
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "你的信息未登记，请核实再进行预约"
      })
      return;
    }
    
    // 检查是否为特定单位，如果是则保存数据并直接跳转
    if (this.data.corp === '温州大学' || this.data.corp === '温州大学饮食管理中心') {
      // 保存数据到本地存储
      let tjData = {
        ptype: 19,
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        sex: this.data.sex,
        yydate: this.data.time,
        cardno: this.data.cardno,
        marry: this.data.hunyin,
        corp: this.data.corp,
        fromsource: wx.getStorageSync('sponsor')
      }
      wx.setStorageSync('tjData', tjData);
      
      // 根据性别确定跳转参数
      let sex = this.data.sex === '男' ? 'nan' : 'nv';
      
      // 清空表单数据
      this.setData({
        mobile: "",
        xinmin: "",
        sex: "",
        time: "",
        cardno: "",
        hunyin: "",
        corp: "",
        fromsource: ""
      })
      
      // 跳转到指定页面
      wx.navigateTo({
        url: '/subpackagesC/wdjiangxiang/wdjiaxiang?sex=' + sex
      })
      return;
    }
    if(this.data.corp=='中国银行'){
      // 保存数据到本地存储，和温州大学一样
      let tjData = {
        ptype: 19,
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        sex: this.data.sex,
        yydate: this.data.time,
        cardno: this.data.cardno,
        marry: this.data.hunyin,
        corp: this.data.corp,
        fromsource: wx.getStorageSync('sponsor')
      }
      wx.setStorageSync('tjData', tjData);
      
      let sex = this.data.sex === '男' ? '男' : '女';
      wx.navigateTo({
        url: '/subpackagesC/zgyhtjxm/zgyhtjxm?sex='+sex+'&year='+this.data.age
      })
      return;
    }
    if(this.data.corp=='温州外国语学校' || this.data.corp=='温州外国语高级中学'){
      // 保存数据到本地存储，和温州大学一样
      let tjData = {
        ptype: 19,
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        sex: this.data.sex,
        yydate: this.data.time,
        cardno: this.data.cardno,
        marry: this.data.hunyin,
        corp: this.data.corp,
        fromsource: wx.getStorageSync('sponsor')
      }
      wx.setStorageSync('tjData', tjData);
      
      let sex = this.data.sex === '男' ? '男' : '女';
      wx.navigateTo({
        url: '/huodongpage/wzwgytjxm/wzwgytjxm?sex='+sex+'&year='+this.data.age
      })
      return;
    }
    let params = {
      ptype: 19,
      openid: wx.getStorageSync('openid'),
      mobile: this.data.mobile,
      xinmin: this.data.xinmin,
      sex: this.data.sex,
      yydate: this.data.time,
      cardno: this.data.cardno,
      marry: this.data.hunyin,
      corp: this.data.corp,
      fromsource: wx.getStorageSync('sponsor')
    }
    req({
      url: util.baseUrl + '/newapi/api/mindex/tjtijian',
      method: "POST",
      data: params,
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          app.globalData.tjyy = {
            id: res.data.otherData,
            unitMoney: res.data.msg,
            danwei:that.data.corp
          }
          this.setData({
            mobile: "",
            xinmin: "",
            sex: "",
            time: "",
            cardno: "",
            hunyin: "",
            corp: "",
            fromsource: ""
          })
          if(res.data.methodDescription=="hpselxiang"){
            wx.navigateTo({
              url: '../../subpackages/hpselxiang/hpselxiang?tjtype='+res.data.msg,
            })
            return;
          }
         
          if (res.data.methodDescription) {
            wx.navigateTo({
              url: '../selectxiang/selectxiang',
            })
            return;
          }
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success(res) {

            }
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
    return {
      title: '个人体检',
      path: '/pages/danweitijian/danweitijian?fromid=' + wx.getStorageSync('openid')
    }
  }
})