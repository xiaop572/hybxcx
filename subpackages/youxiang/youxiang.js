// pages/danweitijian/danweitijian.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
var app = getApp()
var timer = null;
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
    fromsource: "",
    openid: "",
    ptype: 19,
    tjlist: [],
    product: "",
    ordid: 0,
    twImg: "",
    bqImg: "",
    weixin: "",
    memo: "",
    nl:"",
    address:"",
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    this.getTime()
    this.gettjlist();
  },
  gettjlist() {
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjlist",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        this.setData({
          tjlist: res.data.data
        })
      }
    })
  },
  guanbi() {
    this.setData({
      show: false
    })
  },
  getTime() {
    req({
      url: util.baseUrl + "/newapi/api/mindex/tjdate",
      method: "GET",
      data: {
        classid: 1
      },
      success: (res) => {
        this.setData({
          timeList: res.data.data
        })
      }
    })
  },
  bindtjchange(e) {
    console.log()
    this.setData({
      product: this.data.tjlist[e.detail.value]['goodsname'],
      ordid: this.data.tjlist[e.detail.value]['id']
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
  bindhunchange(e) {
    this.setData({
      hunyin: this.data.array[e.detail.value]
    })
  },
  rtijiao() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!this.data.xinmin) {
        wx.showToast({
          title: '请填写姓名!',
        })
        return;
      } else if (!this.data.sex) {
        wx.showToast({
          title: '请选择性别!',
        })
        return;
      } else if (!this.data.nl) {
        wx.showToast({
          title: '请选择年龄!',
        })
        return;
      } else if (!this.data.mobile) {
        wx.showToast({
          title: '请填写联系方式!',
        })
        return;
      } else if (this.data.mobile.length != 11) {
        wx.showToast({
          title: '联系方式不正确',
        })
        return;
      } else if (!this.data.cardno) {
        wx.showToast({
          title: '请填写身份证号!',
        })
        return;
      } else if (this.data.cardno.length != 18) {
        wx.showToast({
          title: '身份证不正确',
        })
        return;
      } else if (!this.data.address) {
        wx.showToast({
          title: '请选择地址!',
        })
        return;
      } else if (!this.data.weixin) {
        wx.showToast({
          title: '请填写微信号',
        })
        return;
      } else if (!this.data.twImg) {
        wx.showToast({
          title: '上传体温图',
        })
        return;
      } else if (!this.data.memo) {
        wx.showToast({
          title: '请填写病情描述',
        })
        return;
      }
      let params = {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        sex: this.data.sex,
        cardno: this.data.cardno,
        weixin: this.data.weixin,
        wendupic: this.data.twImg,
        memo: this.data.memo,
        bingqingpic: this.data.bqImg,
        nl:parseInt(this.data.nl),
        adress:this.data.address
      }
      req({
        url: util.baseUrl + '/newapi/api/youx/postyou',
        method: "POST",
        data: params,
        success: res => {
          this.setData({
            show: true
          })
          if (res.data.status) {
            this.setData({
              mobile: "",
              xinmin: "",
              sex: "",
              cardno: "",
              weixin: "",
              wendupic: "",
              memo: "",
              bingqingpic: "",
              nl:"",
              address:""
            })
          } else {
            wx.showModal({
              title: '提交失败',
              showCancel: false,
              content: res.data.data,
              success(res) {}
            })
          }
        }
      })
    }, 1000)

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  selectImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: (res) => {
        let tempFilePaths = res.tempFiles; // 返回选定照片的本地路径列表 
        this.uploadImg(tempFilePaths);
      }
    })
  },
  uploadImg(path) { // 上传图片
    let that = this;
    console.log(path, "path")
    wx.showToast({
      icon: "loading",
      title: "正在上传……"
    });
    wx.uploadFile({
      url: '上传图片接口url', //后端接口
      filePath: path[0].tempFilePath,
      name: 'file', //这个随便填
      url: util.baseUrl + '/newapi/api/youx/upload', //填写自己服务器的地址。
      header: {
        "Content-Type": "multipart/form-data", //必须是这个格式
        Authorization: 'Bearer ' + wx.getStorageSync('token')
      },
      formData: {},
      success(res) {
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          });
          return;
        } else {
          that.setData({
            twImg: JSON.parse(res.data).data.list[0].file_path
          })
          console.log("上传成功！ 可对返回的值进行操作，比如：存入imgData；");
        }
      },
      fail(e) {
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        });
      },
      complete() {
        wx.hideToast(); //隐藏Toast
      }
    })
  },
  selectImg2() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: (res) => {
        let tempFilePaths = res.tempFiles; // 返回选定照片的本地路径列表 
        this.uploadImg2(tempFilePaths);
      }
    })
  },
  uploadImg2(path) { // 上传图片
    let that = this;
    console.log(path, "path")
    wx.showToast({
      icon: "loading",
      title: "正在上传……"
    });
    wx.uploadFile({
      url: '上传图片接口url', //后端接口
      filePath: path[0].tempFilePath,
      name: 'file', //这个随便填
      url: util.baseUrl + '/newapi/api/youx/upload', //填写自己服务器的地址。
      header: {
        "Content-Type": "multipart/form-data", //必须是这个格式
        Authorization: 'Bearer ' + wx.getStorageSync('token')
      },
      formData: {},
      success(res) {
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          });
          return;
        } else {
          that.setData({
            bqImg: JSON.parse(res.data).data.list[0].file_path
          })
          console.log("上传成功！ 可对返回的值进行操作，比如：存入imgData；");
        }
      },
      fail(e) {
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        });
      },
      complete() {
        wx.hideToast(); //隐藏Toast
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../../pages/login/login',
            })
          }, 1000)
        }
      })
      return;
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