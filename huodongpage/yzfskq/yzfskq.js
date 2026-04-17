const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuthorized: false,
    role: 0, // 1: 院长, 2: 中高层
    cardImage: '',
    shareImage: '',
    showModal: false,
    usage: '',
    phoneNumber: '',
    shareCode: '',
    isGenerated: false,
    
    // 列表相关
    showListModal: false,
    myList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    this.checkAccess()
  },

  checkAccess() {
    wx.showLoading({
      title: '权限校验中',
      mask: true
    })

    req({
      url: util.baseUrl + '/newapi/api/subt/checkaccess',
      data: {
        openid: wx.getStorageSync('openid')
      },
      method: 'POST',
      success: (res) => {
        wx.hideLoading()
        // 接口返回角色ID: 1-院长, 2-中高层
        const role = res.data.otherData; 
        if (role == 1 || role == 2 || role==3) {
          const isDean = role == 1;
          this.setData({
            isAuthorized: true,
            role: role,
            cardImage: isDean ? 'https://wx.pmc-wz.com/materials/fskqkq.png' : 'https://wx.pmc-wz.com/materials/fskqkq2.png',
            shareImage: isDean ? 'https://wx.pmc-wz.com/materials/fskqftx.jpg' : 'https://wx.pmc-wz.com/materials/fskqshare2.jpg'
          })
        } else if (role == 0) {
          wx.showModal({
            title: '提示',
            content: '您的申请正在审核中，请耐心等待',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          this.handleDeny('暂无访问权限或审核未通过');
        }
      },
      fail: (err) => {
        wx.hideLoading()
        this.handleDeny('网络请求失败')
      }
    })
  },

  handleDeny(content) {
    wx.showModal({
      title: '提示',
      content: content || '无权访问',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/huodongpage/sqqx/sqqx',
          })
        }
      }
    })
  },

  showShareModal() {
    this.setData({
      showModal: true,
      usage: '',
      phoneNumber: '',
      isGenerated: false,
      shareCode: ''
    })
  },

  hideShareModal() {
    this.setData({
      showModal: false
    })
  },

  preventBubble() {
    // 阻止冒泡
  },

  onUsageInput(e) {
    this.setData({
      usage: e.detail.value
    })
  },

  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  generateCard() {
    if (!this.data.usage) {
      wx.showToast({
        title: '请输入用途',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '生成中...',
    })

    req({
      url: util.baseUrl + '/newapi/api/subt/apply',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        applyName: this.data.usage, // 传用途
        applyPurpose: String(this.data.phoneNumber), // 传手机号
        applyPhone: "",
        leaderType: 0,
        targetName: "", 
        targetPhone: ""
      },
      success: (res) => {
        wx.hideLoading()
        console.log('申请提交成功', res)
        if (res.data && res.data.status && res.data.data && res.data.data.shareCode) {
           this.setData({
             isGenerated: true,
             shareCode: res.data.data.shareCode
           })
           wx.showToast({
             title: '生成成功',
             icon: 'success'
           })
        } else {
           wx.showToast({
             title: res.data.msg || '生成失败',
             icon: 'none'
           })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('申请提交失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 列表相关逻辑
  showMyList() {
    this.setData({
      showListModal: true,
      myList: [],
      page: 1,
      hasMore: true
    }, () => {
      this.getMyList();
    });
  },

  hideListModal() {
    this.setData({
      showListModal: false
    });
  },

  getMyList() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中' });

    req({
      url: util.baseUrl + '/newapi/api/subt/mylist',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.data) {
          const list = res.data.data;
          // 处理时间格式
          const formattedList = list.map(item => {
             if(item.addtime) {
                 item.addtime = item.addtime.replace('T', ' ');
             }
             return item;
          });

          this.setData({
            myList: this.data.page === 1 ? formattedList : this.data.myList.concat(formattedList),
            page: this.data.page + 1,
            hasMore: list.length >= this.data.pageSize
          });
        } else {
          this.setData({ hasMore: false });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  onListScrollBottom() {
    this.getMyList();
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
  onShareAppMessage(options) {
    const type = this.data.role; // 1: 院长, 2: 中高层
    let shareCode = this.data.shareCode;

    // 如果是从列表中的“重新分享”按钮触发
    if (options.from === 'button' && options.target && options.target.dataset.sharecode) {
       shareCode = options.target.dataset.sharecode;
    }

    const path = `/huodongpage/yzlqkq/yzlqkq?type=${type}&shareCode=${shareCode}`;
    console.log('分享路径:', path);

    // 分享后关闭弹窗 (仅当不是重新分享时关闭，或者根据需求都关闭)
    // this.hideShareModal(); 

    return {
      title: '立减500元！和平国际月子中心专属福利，点击即领！',
      imageUrl: "https://wx.pmc-wz.com/materials/yzfsftx.jpg",
      path: path
    }
  }
})
