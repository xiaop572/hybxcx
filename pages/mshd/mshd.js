// subpackages/miaoshaList/miaoshaList.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: 10,
    proList: [],
    newHours: 0,
    ptproList: [],
    jrmspro:[],
    hxmspro:[],
    currentHour: 0,
    activeCategory: 'zx',
    activeTab: 0,
    zhuliCount: 0, // 当前助力次数，从接口获取
    zhuliPercent: 0, // 进度条百分比
    jfspList: [],
    showGiftModal: false, // 礼盒弹框显示状态
    giftName: '', // 奖品名称
    giftSuccess: false, // 是否抽中奖品
    giftImage: '', // 奖品图片
    showMilestoneModal: false, // 里程碑提示弹框显示状态
    milestoneTarget: 0, // 当前点击的里程碑目标值
    milestoneUnlocked: false // 里程碑是否已解锁
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
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    this.getProList()
    this.getPro()
    this.getZhuliCount() // 获取助力次数
    this.setData({
      currentHour: new Date().getHours()
    });
  },
  // 获取助力次数
  getZhuliCount() {
    req({
      url: util.baseUrl + "/newapi/api/huodong/getassistvalue",
      method: "POST",
      data: {},
      success: (res) => {
        if (res.data.status) {
          const count = res.data.data.assistValue || 0; // 从接口获取助力次数
          this.setData({
            zhuliCount: count,
            zhuliPercent: this.calculatePercent(count)
          });
        }
      },
      fail: () => {
        // 接口失败时设置默认值
        this.setData({
          zhuliCount: 0,
          zhuliPercent: 0
        });
      }
    });
  },
  // 计算进度条百分比（根据里程碑分段计算）
  calculatePercent(count) {
    let percent = 0;
    
    if (count <= 0) {
      percent = 0;
    } else if (count < 5000) {
      // 0-5000 对应 0%-33.33%
      percent = (count / 5000) * 33.33;
      if (percent < 5) percent = 5; // 至少显示5%，让气泡可见
    } else if (count < 10000) {
      // 5000-10000 对应 33.33%-66.67%
      percent = 33.33 + ((count - 5000) / 5000) * 33.34;
    } else if (count < 30000) {
      // 10000-30000 对应 66.67%-100%
      percent = 66.67 + ((count - 10000) / 20000) * 33.33;
    } else {
      // 30000以上显示100%
      percent = 100;
    }
    
    return percent;
  },
  switchCategory(e) {
    const category = e.currentTarget.dataset.id;
    this.setData({
      activeCategory: category
    });
    this.getPro(category);
  },
  rwrhf() {
    wx.navigateTo({
      url: '/huodongpage/lqymjkq/kqymjkq',
    })
  },
  changTime(e) {
    this.setData({
      time: e.currentTarget.dataset.time
    }, () => {
      this.getProList()
    })
  },
  changeTab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.index
    });
  },
  getProList() {
    req({
      url: util.baseUrl + "/newapi/api/ms/mslistelev",
      method: "POST",
      data: {
      },
      success: (res) => {
        if (res.data.status) {
          // 新的数据结构：data 直接是数组
          const dataList = res.data.data || [];
          // 最多显示4个时间选项卡
          this.setData({
            jrmspro: dataList.slice(0, 4),
            hxmspro: []
          })
        }
      }
    })
  },
  rmsPro(e) {
    wx.myNavigateTo({
      url: '../../subpackages/miaoshaPro/miaoshaPro?id=' + e.currentTarget.dataset.id,
    })
  },
  rptPro(e) {
    wx.myNavigateTo({
      url: '../../subpackages/ptpro/ptpro?id=' + e.currentTarget.dataset.id,
    })
  },
  subms(e) {
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
    } else {
      wx.getSetting({
        withSubscriptions: true,
        success: res => {
          wx.requestSubscribeMessage({
            tmplIds: ['Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU'],
            success: res => {
              req({
                url: util.baseUrl + "/frontapi/api/subt/submiaosha",
                method: "POST",
                data: {
                  openid: wx.getStorageSync('openid'),
                  templateid: "Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU",
                  proid: e.currentTarget.dataset.id
                },
                success: (res) => {
                  if (res.data.status) {
                    wx.showToast({
                      title: res.data.data
                    })
                    this.getProList()
                  } else {
                    wx.showToast({
                      title: res.data.data
                    })
                  }
                }
              })
            }
          })
        }
      })
    }

  },
  cansubms(e) {
    req({
      url: util.baseUrl + "/frontapi/api/subt/cancelsubmiaosha",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        templateid: "Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU",
        proid: e.currentTarget.dataset.id
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: res.data.data
          })
          this.getProList()
        } else {
          wx.showToast({
            title: res.data.data
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
    let date = new Date();
    let nowHours = date.getHours();
    this.setData({
      newHours: nowHours,
      currentHour: nowHours
    })
    // if (nowHours == 10 || nowHours == 11 || nowHours == 14 || nowHours == 17 || nowHours == 20) {
    //   this.setData({
    //     time: nowHours
    //   })
    // }
    if (nowHours == 10 || nowHours == 20) {
      this.setData({
        time: nowHours
      })
    }
    // if(nowHours==11 || nowHours ==12 || nowHours==13){
    //   this.setData({
    //     time:11
    //   })
    // }
    this.getPro()
    this.getProList();
    this.getZhuliCount(); // 刷新助力次数
    this.getJifenList();
  },
  getPro(category = 'zx') {
    const stypeMap = {
      zx: 68, // 整形
      kq: 62, // 口腔
      ck: 63, // 产康
      tj: 60  // 体检
    };
    req({
      url: util.baseUrl + "/newapi/api/topic/topicpagelist",
      method: "POST",
      data: {
        "stype": stypeMap[category],
        "curpage": 1,
        "limit": 99999,
        "searchkey": "",
        "sort": 1
      },
      success: res => {
        this.setData({
          ptproList: res.data.data
        })
      }
    })
  },
  getJifenList() {
    req({
      url: util.baseUrl + "/newapi/api/jifen/jifenlist",
      method: "POST",
      data: {
        curpage: 1,
        limit: 3
      },
      success: res => {
        this.setData({
          jfspList: res.data.data
        })
      }
    })
  },
  rjfxq(e) {
    wx.myNavigateTo({
      url: '/pages/jfxq/jfxq?id=' + e.currentTarget.dataset.id,
    })
  },
  rjfdh() {
    wx.navigateTo({
      url: '/subpackages/jifenduihuan/jifenduihuan',
    })
  },
  rptPro(e){
    wx.navigateTo({
      url: "/pages/tcxq/tcxq?id=" + e.currentTarget.dataset.id
    })
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
  
  // 开启礼盒
  openGiftBox() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    req({
      url: util.baseUrl + "/newapi/api/huodong/opengiftbox",
      method: "POST",
      data: {
        openid: openid
      },
      success: (res) => {
        const msg = res.data.msg || '';
        const data = res.data.data || '';
        
        if (res.data.status) {
          // 判断是否中奖：根据data内容判断
          // 如果data包含"恭喜"或"获得"，则是中奖；如果是"谢谢惠顾"则未中奖
          const isWin = data.includes('恭喜') || data.includes('获得');
          
          if (isWin) {
            // 中奖了
            let giftName = '';
            let giftImage = '';
            
            // 从msg中提取奖品名称
            const match = msg.match(/获得(.+)/);
            giftName = match ? match[1] : msg;
            
            console.log('中奖了，msg:', msg, 'giftName:', giftName);
            
            // 根据msg匹配对应的图片
            if (msg.includes('肩颈疼痛调理1次') || msg.includes('肩颈疼痛调理')) {
              giftImage = 'https://wx.pmc-wz.com/materials/jjtll.png';
            } else if (msg.includes('皮肤检测体验券') || msg.includes('皮肤检测')) {
              giftImage = 'https://wx.pmc-wz.com/materials/pfjctyq.png';
            } else if (msg.includes('医用面膜1片') || msg.includes('医用面膜')) {
              giftImage = 'https://wx.pmc-wz.com/materials/yymm.png';
            } else if (msg.includes('3M补牙一次1次') || msg.includes('3M补牙')) {
              giftImage = 'https://wx.pmc-wz.com/materials/3mby.png';
            } else if (msg.includes('光子嫩肤1次') || msg.includes('光子嫩肤')) {
              giftImage = 'https://wx.pmc-wz.com/materials/gznf.png';
            }
            
            this.setData({
              showGiftModal: true,
              giftSuccess: true,
              giftName: giftName,
              giftImage: giftImage
            });
          } else {
            // 未中奖（谢谢惠顾）
            this.setData({
              showGiftModal: true,
              giftSuccess: false,
              giftName: ''
            });
          }
          
          // 刷新助力值
          this.getZhuliCount();
        } else {
          // status: false 需要区分两种情况
          // 1. 已经抽过了：只提示toast
          // 2. 未中奖：显示弹框
          if (msg.includes('已开礼盒') || msg.includes('请明天再来')) {
            // 已经抽过了，只显示toast
            wx.showToast({
              title: msg,
              icon: 'none',
              duration: 2000
            });
          } else {
            // 未中奖，显示弹框
            this.setData({
              showGiftModal: true,
              giftSuccess: false,
              giftName: ''
            });
          }
          
          // 刷新助力值
          this.getZhuliCount();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 关闭礼盒弹框
  closeGiftModal() {
    this.setData({
      showGiftModal: false
    });
  },
  
  // 阻止冒泡
  stopPropagation() {
    // 空函数，阻止点击事件冒泡
  },
  
  // 领取礼品
  receiveGift() {
    this.setData({
      showGiftModal: false
    });
    wx.navigateTo({
      url: '/subpackages/mycard/mycard',
    })
    // 可以跳转到我的卡券页面
    // wx.navigateTo({
    //   url: '/pages/mycard/mycard'
    // });
  },
  
  // 显示里程碑提示弹框
  showMilestoneModal(e) {
    const target = parseInt(e.currentTarget.dataset.target);
    const current = e.currentTarget.dataset.current;
    
    // 判断是否已解锁
    const isUnlocked = current >= target;
    
    console.log('点击礼盒，目标助力数:', target, '当前:', current, '已解锁:', isUnlocked);
    
    this.setData({
      showMilestoneModal: true,
      milestoneTarget: target,
      milestoneUnlocked: isUnlocked
    });
  },
  
  // 关闭里程碑提示弹框
  closeMilestoneModal() {
    this.setData({
      showMilestoneModal: false
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "和平国际年终超级盛典火热进行中，免费抽好礼，积分0元兑……",
      imageUrl: "https://wx.pmc-wz.com/materials/mshdftx.jpg",
      path: '/pages/mshd/mshd?fromid=' + wx.getStorageSync('openid')
    }
  },
  onShareTimeline() {
    return {
      title: "和平国际年终超级盛典火热进行中，免费抽好礼，积分0元兑……",
      imageUrl: "https://wx.pmc-wz.com/materials/mshdftx.jpg",
      path: '/pages/mshd/mshd?fromid=' + wx.getStorageSync('openid')
    }
  },
})