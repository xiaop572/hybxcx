// huodongpage/jifu/jifu.js
const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '至臻寻宝 集月有礼',
    subtitle: '2025和平国际双节献礼计划',
    // 卡片配置信息（动态从接口获取）
    cardConfigs: [],
    // 用户拥有的月卡
    userCards: {},
    // 用户福卡完整列表（包含userfukaid等信息）
    userCardsList: [],
    // 是否已集齐所有卡
    isComplete: false,
    // 已集卡人数（从接口获取）
    collectedCount: 0,
    // 活动规则
    activityRules: [
      '进入活动页可领取一张健康福，前往3F整形美容中心、3F口腔中心、2F体检中心、1F女性与健康中心4大科室前台，扫码即可收集相应福卡（美丽福、平安福、好运福、团圆福），集齐6张福卡即可免费兑换豪礼（医用面膜一盒/M22光子嫩肤1次/超声波洁牙1次，3选1）。'
    ],
    // 是否显示活动规则弹窗
    showRulesPopup: false,
    // 是否显示领取圆满卡弹窗
    showWelcomePopup: false,
    // 是否显示兑换确认弹窗
    showExchangePopup: false,
    // 待兑换的福卡信息
    exchangeCardInfo: null,
    // 是否显示兑换成功弹窗
    showSuccessPopup: false,
    // 兑换成功弹窗背景：单个福 dhcgbg.png，合成福 xfdhcbg.png
    successPopupBg: 'xfdhcbg.png',
    // 兑换成功的礼品信息
    successGiftInfo: null,
    // 是否显示合成确认弹窗（小福袋）
    showComposePopup: false,
    // 是否显示大福袋合成确认弹窗
    showBigComposePopup: false,
    // 图片基础路径
    baseImageUrl: 'https://wx.pmc-wz.com/materials/',
    // 福卡兑换图片映射
    exchangeImages: {
      '好运福': 'rhyfhax.png',
      '健康福': 'rjkfhc14.png',
      '美丽福': 'rmlfhgz.png',
      '平安福': 'rpafhcjb.png',
      '团圆福': 'ryyfhjy.png'
    },
    // 礼品图片映射（兑换成功后显示）
    giftImages: {
      '健康福': { image: 'jfc14.png', name: 'C14健康检测1次', desc: '' },
      '美丽福': { image: 'jfgznf.png', name: '光子嫩肤1次', desc: '' },
      '平安福': { image: 'jfcsbiy.png', name: '超声波洁牙1次', desc: '' },
      '好运福': { image: 'jfaxyl.png', name: '艾香疗愈全身调理1次', desc: '' },
      '团圆福': { image: 'jftwcjb.png', name: '体外冲击波治疗1次', desc: '' }
    }
  },
  rtcxq(e){
    let {tcid}=e.currentTarget.dataset;
    console.log(tcid)
    wx.navigateTo({
      url: '/pages/tcxq/tcxq?id='+tcid,
    })
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('页面初次渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新获取数据
    this.initUserCards();
    this.getCollectedCount();
  },
  
  // 获取集齐福卡人数统计
  getCollectedCount() {
    req({
      url: util.baseUrl + '/newapi/api/weight/getfukastat',
      method: 'GET',
      success: (res) => {
        console.log('=== 获取集齐福卡人数统计 ===');
        console.log('完整返回:', JSON.stringify(res.data));
        
        if (res.data && res.data.status) {
          // data字段直接就是数字
          const collectedCount = res.data.data || 0;
          console.log('集齐人数:', collectedCount);
          
          this.setData({
            collectedCount: collectedCount
          });
        }
      },
      fail: (err) => {
        console.error('获取集齐福卡人数失败:', err);
      }
    });
  },
  
  // 初始化用户卡片数据
  initUserCards() {
    // 默认卡片状态
    const defaultCards = {
      jiankang: false,
      meili: false,
      pingan: false,
      haoyun: false,
      tuanyuan: false,
      wanneng: false
    };
    
    // 直接设置固定的福卡配置
    const fixedCardConfigs = [
      { id: 1, name: '健康福', key: 'jiankang', ownedImage: 'jkf.png', unownedImage: 'jkf-h.png' },
      { id: 2, name: '美丽福', key: 'meili', ownedImage: 'mlf.png', unownedImage: 'mlf-h.png' },
      { id: 3, name: '平安福', key: 'pingan', ownedImage: 'paf.png', unownedImage: 'paf-h.png' },
      { id: 4, name: '好运福', key: 'haoyun', ownedImage: 'hyf.png', unownedImage: 'hyf-h.png' },
      { id: 5, name: '团圆福', key: 'tuanyuan', ownedImage: 'yyf.png', unownedImage: 'yyf-h.png' },
      { id: 6, name: '万能福', key: 'wanneng', ownedImage: 'wnf-h.png', unownedImage: 'wnf-h.png' }
    ];
    
    this.setData({
      cardConfigs: fixedCardConfigs
    });
    
    // 获取用户福卡状态
    this.getUserCards(defaultCards);
  },
  

  
  // 获取用户拥有的福卡状态
  getUserCards(defaultCards) {
    const openid = wx.getStorageSync('openid');


    req({
      url: util.baseUrl + '/newapi/api/weight/getuserfukas',
      method: 'POST',
      data: {
        openid: openid,
        curpage: 1,
        limit: 10000
      },
      success: (res) => {
        console.log('=== 获取用户福卡信息 ===');
        console.log('完整返回:', JSON.stringify(res.data));
        
        if (res.data && res.data.status) {
          const userCards = res.data.data.list || [];
          const cardConfigs = this.data.cardConfigs;
          
          console.log('用户福卡列表:', userCards);
          console.log('福卡数量:', userCards.length);
          
          // 处理用户福卡数据 - 根据cardname匹配
          const processedCards = {};
          const cardNameMap = {
            '健康福': 'jiankang',
            '美丽福': 'meili',
            '平安福': 'pingan',
            '好运福': 'haoyun',
            '团圆福': 'tuanyuan',
            '万能福': 'wanneng'
          };
          
          // 初始化所有卡片为false
          cardConfigs.forEach(config => {
            processedCards[config.key] = false;
          });
          
          // 根据用户拥有的福卡更新状态
          userCards.forEach(card => {
            console.log('处理福卡:', card.cardname);
            const cardKey = cardNameMap[card.cardname];
            if (cardKey) {
              processedCards[cardKey] = true;
              console.log('✅ 点亮福卡:', cardKey);
            } else {
              console.warn('⚠️ 未匹配到福卡:', card.cardname);
            }
          });
          
          console.log('处理后的用户卡片:', processedCards);
          console.log('=== userCardsList 详细信息 ===');
          userCards.forEach(card => {
            console.log('福卡:', {
              cardname: card.cardname,
              cardid: card.cardid,
              userfukaid: card.userfukaid,
              id: card.id,
              完整数据: card
            });
          });
          
          this.setData({
            userCards: processedCards,
            userCardsList: userCards,
            isComplete: this.checkIsComplete(processedCards)
          });
          
          // 检查是否已领取健康福
          const hasJiankangCard = processedCards.jiankang;
          if (!hasJiankangCard) {
            this.setData({
              showWelcomePopup: false
            });
          }
        } else {
          
          // 接口返回失败，使用默认数据
          this.setData({
            userCards: defaultCards,
            isComplete: this.checkIsComplete(defaultCards)
          });
          
          // 检查是否已领取健康福（cardid=1），如果没有则显示弹窗
          if (!defaultCards.jiankang) {
            this.setData({
              showWelcomePopup: false
            });
          }
        }
      },
      fail: (err) => {
        // 网络错误，使用默认数据
        this.setData({
          userCards: defaultCards,
          isComplete: this.checkIsComplete(defaultCards)
        });
        
        // 检查是否已领取健康福（cardid=1），如果没有则显示弹窗
        if (!defaultCards.jiankang) {
          this.setData({
            showWelcomePopup: true
          });
        }
      }
    });
  },
  
  // 检查是否集齐所有卡片
  checkIsComplete(cards) {
    const cardConfigs = this.data.cardConfigs;
    if (!cardConfigs || cardConfigs.length === 0) {
      return false;
    }
    return cardConfigs.every(config => cards[config.key]);
  },
  
  // 显示活动规则
  showRules() {
    this.setData({
      showRulesPopup: true
    });
  },
  
  // 关闭活动规则
  closeRules() {
    this.setData({
      showRulesPopup: false
    });
  },

  // 阻止弹窗内容区域点击穿透
  noop() {},
  
  // 点击福卡显示兑换确认弹窗
  exchangeSingleCard(e) {
    const cardid = e.currentTarget.dataset.cardid;
    const cardname = e.currentTarget.dataset.cardname;
    const hasCard = e.currentTarget.dataset.hascard;
    
    console.log('=== 点击福卡 ===');
    console.log('cardid:', cardid, '类型:', typeof cardid);
    console.log('cardname:', cardname);
    console.log('是否拥有:', hasCard);
    
    // 检查是否拥有该福卡
    if (!hasCard) {
      wx.showToast({
        title: '您还未获取该福卡',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 从用户福卡列表中找到对应的福卡信息
    const userCardsList = this.data.userCardsList;
    console.log('用户福卡列表:', userCardsList);
    console.log('列表中的福卡信息:', userCardsList.map(card => ({
      cardid: card.cardid,
      cardname: card.cardname,
      userfukaid: card.userfukaid
    })));
    
    // 先尝试通过 cardid 查找（支持字符串和数字比较）
    let targetCard = userCardsList.find(card => String(card.cardid) === String(cardid));
    
    // 如果通过 cardid 找不到，尝试通过 cardname 查找
    if (!targetCard && cardname) {
      console.log('通过cardid未找到，尝试通过cardname查找:', cardname);
      targetCard = userCardsList.find(card => card.cardname === cardname);
    }
    
    console.log('最终找到的福卡:', targetCard);
    console.log('=== 福卡完整数据 ===');
    console.log('cardname:', targetCard?.cardname);
    console.log('cardid:', targetCard?.cardid);
    console.log('userfukaid:', targetCard?.userfukaid);
    console.log('id:', targetCard?.id);
    console.log('完整对象:', JSON.stringify(targetCard));
    
    if (!targetCard) {
      wx.showToast({
        title: '未找到该福卡',
        icon: 'none'
      });
      return;
    }
    
    // 尝试多种可能的字段名（接口可能返回 id、userfukaid、userFukaId 等）
    const userfukaid = targetCard.userfukaid || targetCard.userFukaId || targetCard.id || 0;
    
    console.log('最终使用的 userfukaid:', userfukaid);
    
    // 显示兑换确认弹窗
    this.setData({
      showExchangePopup: true,
      exchangeCardInfo: {
        name: targetCard.cardname,
        cardid: targetCard.cardid,
        userfukaid: userfukaid
      }
    });
  },

  // 确认兑换福卡
  confirmExchange() {
    const openid = wx.getStorageSync('openid');
    const exchangeCardInfo = this.data.exchangeCardInfo;
    
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }
    
    if (!exchangeCardInfo) {
      wx.showToast({
        title: '福卡信息错误',
        icon: 'none'
      });
      return;
    }
    
    // 关闭弹窗
    this.setData({
      showExchangePopup: false
    });

    wx.showLoading({
      title: '兑换中...'
    });

    req({
      url: util.baseUrl + '/newapi/api/weight/exchangeonefuka',
      method: 'POST',
      data: {
        openid: openid,
        userFukaId: exchangeCardInfo.userfukaid
      },
      success: (res) => {
        wx.hideLoading();
        console.log('兑换福卡成功:', res);
        if (res.data && res.data.status) {
          // 获取兑换的礼品信息
          const giftInfo = this.data.giftImages[exchangeCardInfo.name];
          
          // 显示兑换成功弹窗（单个福用 dhcgbg.png）
          this.setData({
            showSuccessPopup: true,
            successPopupBg: 'dhcgbg.png',
            successGiftInfo: giftInfo
          });
          
          // 刷新用户福卡信息
          this.initUserCards();
        } else {
          wx.showToast({
            title: res.data.msg || '兑换失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('兑换福卡失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 取消兑换，去集福
  cancelExchange() {
    this.setData({
      showExchangePopup: false,
      exchangeCardInfo: null
    });
  },

  // 关闭兑换成功弹窗
  closeSuccessPopup() {
    this.setData({
      showSuccessPopup: false,
      successPopupBg: 'xfdhcbg.png',
      successGiftInfo: null
    });
    wx.navigateTo({
      url: '/subpackages/mycard/mycard',
    })
  },

  // 显示合成确认弹窗
  showCompose() {
    const userCards = this.data.userCards;
    const hasWanneng = userCards.wanneng;
    
    console.log('点击合成福卡，用户拥有万能福:', hasWanneng);
    
    // 如果有万能福，显示大福袋合成弹窗，否则显示小福袋合成弹窗
    // 不再检查是否集齐，由后端判断是否可以兑换
    if (hasWanneng) {
      console.log('显示大福袋合成弹窗');
      this.setData({
        showBigComposePopup: true
      });
    } else {
      console.log('显示小福袋合成弹窗');
      this.setData({
        showComposePopup: true
      });
    }
  },

  // 确认合成福卡
  confirmCompose() {
    const openid = wx.getStorageSync('openid');
    
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }
    
    // 关闭弹窗
    this.setData({
      showComposePopup: false
    });

    wx.showLoading({
      title: '合成中...'
    });

    req({
      url: util.baseUrl + '/newapi/api/weight/exchangeyearfuka',
      method: 'POST',
      data: {
        openid: openid,
        userfukaid: 0
      },
      success: (res) => {
        wx.hideLoading();
        console.log('合成福卡成功:', res);
        if (res.data && res.data.status) {
          // 显示合成成功弹窗（合成福用 xfdhcbg.png）
          this.setData({
            showSuccessPopup: true,
            successPopupBg: 'xfdhcbg.png',
            successGiftInfo: {
              image: 'xfd.png',
              name: '健康美小福袋',
              desc: '蜗旋CT单部位、冷光美白、水杨酸祛痘、\n彩虹定制护肤、3M250树脂补牙/颗、背部SPA\n（6选1）'
            }
          });
          
          // 刷新用户福卡信息
          this.initUserCards();
        } else {
          wx.showToast({
            title: res.data.data || '合成失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('合成福卡失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 取消合成，去集福
  cancelCompose() {
    this.setData({
      showComposePopup: false
    });
  },

  // 确认合成大福袋
  confirmBigCompose() {
    const openid = wx.getStorageSync('openid');
    
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }
    
    // 关闭弹窗
    this.setData({
      showBigComposePopup: false
    });

    wx.showLoading({
      title: '合成中...'
    });

    req({
      url: util.baseUrl + '/newapi/api/weight/exchangeyearfuka',
      method: 'POST',
      data: {
        openid: openid,
        userfukaid: 0
      },
      success: (res) => {
        wx.hideLoading();
        console.log('合成大福袋成功:', res);
        if (res.data && res.data.status) {
          // 显示合成成功弹窗（合成福用 xfdhcbg.png）
          this.setData({
            showSuccessPopup: true,
            successPopupBg: 'xfdhcbg.png',
            successGiftInfo: {
              image: 'dfd.png',
              name: '健康美大福袋',
              desc: '2026速美V脸尊享卡、2026家庭口腔健康年卡、优享健体检套餐、2026产后康金卡、4选1'
            }
          });
          
          // 刷新用户福卡信息
          this.initUserCards();
        } else {
          wx.showToast({
            title: res.data.data || '合成失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('合成大福袋失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 取消大福袋合成，去集福
  cancelBigCompose() {
    this.setData({
      showBigComposePopup: false
    });
  },

  // 兑换礼品
  exchangeGift() {
    if (!this.data.isComplete) {
      wx.showToast({
        title: '请先集齐所有福卡',
        icon: 'none'
      });
      return;
    }

    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }

    // 获取用户福卡ID，这里使用第一张福卡的ID作为示例
    // 根据实际业务需求，可能需要选择特定的福卡或者传入特定的userfukaid
    const userCardsList = this.data.userCardsList;
    if (!userCardsList || userCardsList.length === 0) {
      wx.showToast({
        title: '未找到福卡信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '兑换中...'
    });

    req({
      url: util.baseUrl + '/newapi/api/weight/exchangefuka',
      method: 'POST',
      data: {
        openid: openid,
        userfukaid: 0
      },
      success: (res) => {
        wx.hideLoading();
        console.log('兑换福卡成功:', res);
        if (res.data && res.data.status) {
          wx.showToast({
            title: '兑换成功！',
            icon: 'success'
          });
          // 兑换成功后可能需要刷新用户福卡信息
          // this.getUserCards();
        } else {
          wx.showToast({
            title: res.data.data || '兑换失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('兑换福卡失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 关闭欢迎弹窗
   */
  closeWelcomePopup() {
    this.setData({
      showWelcomePopup: false
    });
  },

  /**
   * 领取健康福
   */
  claimCard() {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }

    req({
      url: util.baseUrl + '/newapi/api/weight/scanaddfuka',
      method: 'POST',
      data: {
        openid: openid,
        cardid: 1  // 健康福
      },
      success: (res) => {
        console.log('领取卡片成功:', res);
        if (res.data && res.data.status) {
          wx.showToast({
            title: '恭喜获得健康福！',
            icon: 'success'
          });
          // 关闭弹窗
          this.closeWelcomePopup();
          // 重新获取用户福卡信息
          this.getUserCards();
        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('领取卡片失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 查看卡片详情
  viewCardDetail(e) {
    const cardType = e.currentTarget.dataset.card;
    const cardName = {
      jiankang: '健康福',
      meili: '美丽福',
      pingan: '平安福',
      haoyun: '好运福',
      tuanyuan: '团圆福',
      wanneng: '万能福'
    }[cardType];
    
    const hasCard = this.data.userCards[cardType];
    
    wx.showToast({
      title: hasCard ? `已拥有${cardName}` : `未拥有${cardName}`,
      icon: 'none'
    });
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('页面隐藏');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('页面卸载');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新时可以重新获取数据
    this.initUserCards();
    this.getCollectedCount();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('页面上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '健康美就是福·2026 新春马上有福，抱福打卡、扫福抽卡、抢福袋…五大玩法嗨不停',
      imageUrl: "https://wx.pmc-wz.com/materials/jifuftx.jpg",
      path: '/pages/jifu/jifu?fromid=' + wx.getStorageSync('openid')
    };
  }
})