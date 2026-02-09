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
    // 已集卡人数
    collectedCount: 268,
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
    // 图片基础路径
    baseImageUrl: 'https://wx.pmc-wz.com/materials/',
    // 福卡兑换图片映射
    exchangeImages: {
      '好运福': 'rhyfhax.png',
      '健康福': 'rjkfhc14.png',
      '美丽福': 'rmlfhgz.png',
      '平安福': 'rpafhcjb.png',
      '团圆福': 'rryfhjy.png'
    }
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
    
    // 直接设置固定的福卡配置 - 使用name作为主键
    const fixedCardConfigs = [
      { name: '健康福', key: 'jiankang', ownedImage: 'jkf.png', unownedImage: 'jkf-h.png' },
      { name: '美丽福', key: 'meili', ownedImage: 'mlf.png', unownedImage: 'mlf-h.png' },
      { name: '平安福', key: 'pingan', ownedImage: 'paf.png', unownedImage: 'paf-h.png' },
      { name: '好运福', key: 'haoyun', ownedImage: 'hyf.png', unownedImage: 'hyf-h.png' },
      { name: '团圆福', key: 'tuanyuan', ownedImage: 'yyf.png', unownedImage: 'yyf-h.png' },
      { name: '万能福', key: 'wanneng', ownedImage: 'wnf.png', unownedImage: 'wnf.png' }
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
        console.log('完整返回数据:', JSON.stringify(res.data));
        console.log('res.data.status:', res.data?.status);
        console.log('res.data.data:', res.data?.data);
        console.log('res.data.data.list:', res.data?.data?.list);
        
        if (res.data && res.data.status) {
          const userCards = res.data.data.list || [];
          const cardConfigs = this.data.cardConfigs;
          
          console.log('=== 用户福卡列表 ===');
          console.log('福卡数量:', userCards.length);
          console.log('userCards是否为数组:', Array.isArray(userCards));
          console.log('完整list数据:', JSON.stringify(userCards));
          
          if (userCards.length === 0) {
            console.warn('⚠️ 警告：userCards 是空数组！用户没有福卡！');
          }
          
          userCards.forEach((card, idx) => {
            console.log(`第${idx + 1}张福卡:`, card.cardname, '完整数据:', JSON.stringify(card));
          });
          
          // 处理用户福卡数据 - 根据cardname匹配，更可靠
          const processedCards = {};
          const cardNameMap = {
            '健康福': 'jiankang',
            '美丽福': 'meili',
            '平安福': 'pingan',
            '好运福': 'haoyun',
            '团圆福': 'tuanyuan',
            '万能福': 'wanneng'
          };
          
          console.log('=== 开始处理福卡 ===');
          
          // 初始化所有卡片为false
          cardConfigs.forEach(config => {
            processedCards[config.key] = false;
            console.log('初始化福卡:', config.name, config.key, '状态: false');
          });
          
          // 根据用户拥有的福卡更新状态
          console.log('准备遍历userCards, 长度:', userCards.length);
          
          if (userCards.length === 0) {
            console.warn('警告: userCards 是空数组！');
          }
          
          userCards.forEach((card, index) => {
            console.log('===================');
            console.log('处理第', index + 1, '张福卡');
            console.log('card对象:', card);
            console.log('cardname原始值:', card.cardname);
            console.log('cardname类型:', typeof card.cardname);
            console.log('cardname编码:', JSON.stringify(card.cardname));
            
            // 打印cardname的每个字符
            if (card.cardname) {
              console.log('cardname字符拆分:');
              for (let i = 0; i < card.cardname.length; i++) {
                console.log(`  [${i}]: "${card.cardname[i]}" (code: ${card.cardname.charCodeAt(i)})`);
              }
            }
            
            // 尝试去除可能的空格和特殊字符
            const cleanCardName = card.cardname ? card.cardname.trim() : '';
            console.log('清理后:', cleanCardName);
            
            // 测试映射
            console.log('cardNameMap["健康福"]:', cardNameMap['健康福']);
            console.log('cleanCardName === "健康福":', cleanCardName === '健康福');
            
            const cardKey = cardNameMap[cleanCardName];
            console.log('映射结果 cardKey:', cardKey);
            
            if (cardKey) {
              console.log('✅ 匹配成功！设置', cardKey, '= true');
              processedCards[cardKey] = true;
              console.log('processedCards[' + cardKey + ']:', processedCards[cardKey]);
            } else {
              console.error('❌ 匹配失败！');
              console.log('期望的key列表:', Object.keys(cardNameMap));
            }
          });
          
          console.log('遍历完成，共处理', userCards.length, '张福卡');
          
          console.log('=== 最终处理结果 ===');
          console.log('processedCards:', JSON.stringify(processedCards));
          
          this.setData({
            userCards: processedCards,
            userCardsList: userCards,
            isComplete: this.checkIsComplete(processedCards)
          }, () => {
            console.log('=== setData 完成后 ===');
            console.log('this.data.userCards:', JSON.stringify(this.data.userCards));
            console.log('this.data.cardConfigs:', this.data.cardConfigs.map(c => c.name + ':' + c.key));
          });
          
          // 检查是否已领取健康福，如果没有则显示弹窗
          const hasJiankangCard = processedCards.jiankang;
          if (!hasJiankangCard) {
            this.setData({
              showWelcomePopup: true
            });
          }
        } else {
          wx.showToast({
            title: '用户福卡获取失败',
            icon: 'none'
          });
          
          // 接口返回失败，使用默认数据
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
      },
      fail: (err) => {
        console.error('获取用户福卡信息失败:', err);
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

  // 阻止点击事件冒泡
  noop() {},
  
  // 点击福卡显示兑换确认弹窗
  exchangeSingleCard(e) {
    const cardname = e.currentTarget.dataset.cardname;
    const hasCard = e.currentTarget.dataset.hascard;
    const cardkey = e.currentTarget.dataset.cardkey;
    
    console.log('点击福卡:', cardname, '是否拥有:', hasCard);
    
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
    const targetCard = userCardsList.find(card => card.cardname === cardname);
    
    if (!targetCard) {
      wx.showToast({
        title: '未找到该福卡',
        icon: 'none'
      });
      return;
    }
    
    // 显示兑换确认弹窗
    this.setData({
      showExchangePopup: true,
      exchangeCardInfo: {
        name: cardname,
        key: cardkey,
        userfukaid: targetCard.userfukaid || 0,
        cardid: targetCard.cardid
      }
    });
  },

  // 确认兑换福卡
  confirmExchange() {
    const openid = wx.getStorageSync('openid');
    
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }
    
    const exchangeCardInfo = this.data.exchangeCardInfo;
    
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
      url: util.baseUrl + '/newapi/api/weight/exchangefuka',
      method: 'POST',
      data: {
        openid: openid,
        userfukaid: exchangeCardInfo.userfukaid
      },
      success: (res) => {
        wx.hideLoading();
        console.log('兑换福卡成功:', res);
        if (res.data && res.data.status) {
          wx.showToast({
            title: '兑换成功！',
            icon: 'success',
            duration: 2000
          });
          // 兑换成功后刷新用户福卡信息
          setTimeout(() => {
            this.initUserCards();
          }, 2000);
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

  // 取消兑换，去集福
  cancelExchange() {
    this.setData({
      showExchangePopup: false,
      exchangeCardInfo: null
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
        cardname: '健康福'  // 使用cardname而不是cardid
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