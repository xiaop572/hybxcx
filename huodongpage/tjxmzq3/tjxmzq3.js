// huodongpage/getfuka/getfuka.js
const { req } = require('../../utils/request')
const { baseUrl, imgBaseUrl } = require('../../utils/util')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cardId: '',
    cardInfo: null,
    loading: false,
    received: false,
    showErrorPopup: false,
    errorMessage: '',
    blessingText: '',
    alreadyDrawn: false, // 今天是否已经抽过
    cardTypes: {
      '1': { name: '健康福', image: 'https://wx.pmc-wz.com/materials/cjkf.png', desc: '祝您身体健康' },
      '2': { name: '美丽福', image: 'https://wx.pmc-wz.com/materials/cmlf.png', desc: '让您焕发青春光彩' },
      '3': { name: '平安福', image: 'https://wx.pmc-wz.com/materials/cpaf.png', desc: '守护您平安喜乐' },
      '4': { name: '好运福', image: 'https://wx.pmc-wz.com/materials/chyf.png', desc: '祝您好运连连' },
      '5': { name: '团圆福', image: 'https://wx.pmc-wz.com/materials/cyyf.png', desc: '愿您阖家团圆' },
      '6': { name: '万能福', image: 'https://wx.pmc-wz.com/materials/wnf.png', desc: '万事如意心想事成' }
    },
    blessings: [
      '福至·身健·心明·人美，\n马年四件套请签收',
      '愿新的一年，跑出健康，\n跑出光彩，跑向属于自己的旷野！',
      '身如骏马般轻盈矫健，\n心似明镜般从容澄澈',
      '新的一年，愿你我体魄强健，\n神采飞扬',
      '愿您蹄跃福至，身健神昂；\n心明颜焕，岁岁春芳',
      '愿您马踏祥云，康健相随；\n风华常驻，福满年华',
      '愿您金鬃迎福，体韧如松；\n镜心玉貌，步履生风',
      '愿您马跃千川，身姿飒爽；\n心映韶光，颜华永彰',
      '愿您蹄声载福，身若云骏；\n神朗体健，颜华岁新',
      '愿您扬鬃送瑞，步履生辉；\n形魄双全，心镜长明',
      '愿您福驰如马，康驻似山；\n容光映日，美意延年',
      '愿您金蹄踏岁，形影翩然；\n气清神旺，福润华颜',
      '愿您马跃春山，体韧心宽；\n福泽养貌，风华自翩',
      '以马为梦，以健为程，\n福气与光彩，如影随形',
      '您的马年 “美” 运已送达，\n请查收这份容光焕发的快乐！',
      '身如骏马，美若朝霞。\n2026，为健康美加油！'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 直接调用接口获取随机福卡
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
  },

  /**
   * 获取随机福卡
   */
  getRandomCard() {
    const openid = wx.getStorageSync('openid')

    req({
      url: baseUrl + '/newapi/api/huodong/givenanhuitj',
      method: 'POST',
      data: {
        openid: openid,
        money:0,
        proid:0
      },
      success: (res) => {
        
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  },

  /**
   * 查看我的福卡（领取后跳转）
   */
  claimCard() {
    const openid = wx.getStorageSync('openid')

    req({
      url: baseUrl + '/newapi/api/huodong/givenanhuitj',
      method: 'POST',
      data: {
        openid: openid,
        money:0,
        proid:0
      },
      success: (res) => {
        if(res.data.status){
          wx.showToast({
            title: res.data.data,
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/subpackages/mycard/mycard',
            })
          }, 1500)
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel:false
          })
        }
        
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
   
  },

  /**
   * 关闭错误提示弹窗（收下祝福去集福）
   */
  closeErrorPopup() {
    this.setData({
      showErrorPopup: false
    })
    wx.switchTab({
      url: '/pages/jifu/jifu',
    })
  },



  /**
   * 查看我的福卡
   */
  viewMyCards() {
    wx.navigateTo({
      url: '/pages/mycards/mycards'
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
})