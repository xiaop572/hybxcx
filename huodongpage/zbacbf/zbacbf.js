// huodongpage/zbacbf/zbacbf.js
const util = require('../../utils/util');
const { req } = require("../../utils/request");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedTeam: '', // 选中的队伍：'温州' 或 '丽水'
    winScore: '', // 胜方得分
    loseScore: '' // 负方得分
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 选择队伍
   */
  selectTeam(e) {
    const team = e.currentTarget.dataset.team;
    this.setData({
      selectedTeam: team
    });
  },

  /**
   * 输入胜方得分
   */
  onWinScoreInput(e) {
    this.setData({
      winScore: e.detail.value
    });
  },

  /**
   * 输入负方得分
   */
  onLoseScoreInput(e) {
    this.setData({
      loseScore: e.detail.value
    });
  },

  /**
   * 获取手机号
   */
  getPhoneNumber(e) {
    console.log('获取手机号:', e);
    const { selectedTeam, winScore, loseScore } = this.data;

    // 验证是否选择了队伍
    if (!selectedTeam) {
      wx.showToast({
        title: '请先选择支持的队伍',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 验证是否输入了比分
    if (winScore === '' || loseScore === '') {
      wx.showToast({
        title: '请输入比分',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 验证比分是否合法
    const win = parseInt(winScore);
    const lose = parseInt(loseScore);
    
    if (isNaN(win) || isNaN(lose) || win < 0 || lose < 0) {
      wx.showToast({
        title: '请输入有效的比分',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 检查截止时间
    const deadline = new Date('2026-01-22 19:29:00');
    const now = new Date();
    

    // 用户授权手机号
    if (e.detail.iv && e.detail.encryptedData) {
      req({
        url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: res => {
            console.log('获取手机号接口返回:', res.data);
            // 获取手机号成功，调用提交竞猜接口
              this.submitData(res.data);
        },
        fail: () => {
          wx.showToast({
            title: '获取手机号失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '需要授权手机号才能提交',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 提交竞猜数据
   */
  submitData(mobile) {
    console.log('submitData 接收到的 mobile:', mobile);
    const { selectedTeam, winScore, loseScore } = this.data;
    
    // 获取 openid（从缓存中获取）
    const openid = wx.getStorageSync('openid') || '';
    
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 准备提交的数据
    const submitParams = {
      openid: openid,
      mobile:String(mobile), // 解密后的手机号
      win: selectedTeam, // 温州 或 丽水
      fenshu1: winScore, // 温州队分数
      fenshu2: loseScore // 丽水队分数
    };
    
    console.log('提交竞猜参数:', submitParams);

    // 调用接口提交数据
    req({
      url: util.baseUrl + '/newapi/api/xys/tjzheba',
      method: 'POST',
      data: submitParams,
      success: (res) => {
        if (res.data && res.data.status) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          });
          
          // 提交后清空表单
          this.setData({
            selectedTeam: '',
            winScore: '',
            loseScore: ''
          });
        } else {
          wx.showToast({
            title: res.data.msg || '提交失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        console.error('提交失败：', err);
      }
    });
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
   * 用户点击右上角分享给好友
   */
  onShareAppMessage: function () {
    return {
      title: '浙BA四强赛竞猜 赢健康美大礼！',
      path: '/huodongpage/zbacbf/zbacbf?fromid=' + wx.getStorageSync('openid'),
      imageUrl: "https://wx.pmc-wz.com/materials/zbaftx.jpg"
    };
  },

  /**
   * 用户分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: '重返主场，决赛晋级之战，竞猜赢健康美礼',
      path: '/huodongpage/zbacbf/zbacbf?fromid=' + wx.getStorageSync('openid'),
      imageUrl: "https://wx.pmc-wz.com/materials/zbaftx.jpg"
    };
  }
})
