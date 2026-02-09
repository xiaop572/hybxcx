// tjfa.js
Page({
  data: {
    deepCheckExpanded: false,
    preciseCheckExpanded: false,
    searchValue: '',
    itemList: [
      {
        id: 1,
        name: '血清胱抑素（CystatinC)测定',
        desc: '检测肾功能，评估肾小球滤过率',
        price: 120,
        selected: false
      },
      {
        id: 2,
        name: '血清载脂蛋白B测定',
        desc: '评估心血管疾病风险',
        price: 85,
        selected: false
      },
      {
        id: 3,
        name: '血清载脂蛋白A1测定',
        desc: '评估心血管疾病风险',
        price: 85,
        selected: false
      },
      {
        id: 4,
        name: '血常规',
        desc: '检查血液基本情况',
        price: 35,
        selected: false
      },
      {
        id: 5,
        name: '肝功能',
        desc: '评估肝脏功能状态',
        price: 120,
        selected: false
      },
      {
        id: 6,
        name: '肾功能',
        desc: '评估肾脏功能状态',
        price: 110,
        selected: false
      },
      {
        id: 7,
        name: '甲状腺功能',
        desc: '评估甲状腺功能',
        price: 180,
        selected: false
      },
      {
        id: 8,
        name: '血脂四项',
        desc: '评估血脂水平',
        price: 90,
        selected: false
      },
      {
        id: 9,
        name: '心电图',
        desc: '检查心脏电活动',
        price: 60,
        selected: false
      },
      {
        id: 10,
        name: '胸部正位片',
        desc: '检查胸部器官情况',
        price: 80,
        selected: false
      },
      {
        id: 11,
        name: '腹部超声',
        desc: '检查腹部器官情况',
        price: 150,
        selected: false
      },
      {
        id: 12,
        name: '尿常规',
        desc: '检查尿液基本情况',
        price: 25,
        selected: false
      },
      {
        id: 13,
        name: '糖化血红蛋白',
        desc: '评估血糖控制情况',
        price: 95,
        selected: false
      },
      {
        id: 14,
        name: '血清同型半胱氨酸测定',
        desc: '评估心脑血管疾病风险',
        price: 110,
        selected: false
      },
      {
        id: 15,
        name: '颈动脉超声',
        desc: '检查颈动脉情况',
        price: 180,
        selected: false
      }
    ],
    totalPrice: 0,
    totalCount: 0
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
  },

  // 切换深入检查方案展开/收起状态
  toggleDeepCheck: function() {
    this.setData({
      deepCheckExpanded: !this.data.deepCheckExpanded
    });
  },

  // 切换精准筛查方案展开/收起状态
  togglePreciseCheck: function() {
    this.setData({
      preciseCheckExpanded: !this.data.preciseCheckExpanded
    });
  },

  // 搜索框输入事件
  onSearchInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  // 搜索框确认事件
  onSearchConfirm: function(e) {
    const value = e.detail.value;
    // 实现搜索逻辑
    wx.showToast({
      title: '搜索: ' + value,
      icon: 'none'
    });
  },

  // 切换项目选择状态
  toggleItemSelection: function(e) {
    const index = e.currentTarget.dataset.index;
    const itemList = this.data.itemList;
    
    itemList[index].selected = !itemList[index].selected;
    this.updateTotals(itemList);
  },

  // 更新总价和总数量
  updateTotals: function(itemList) {
    let totalPrice = 0;
    let totalCount = 0;
    
    itemList.forEach(item => {
      if (item.selected) {
        totalPrice += item.price;
        totalCount += 1;
      }
    });
    
    this.setData({
      itemList,
      totalPrice,
      totalCount
    });
  },

  // 去结算
  goToCheckout: function() {
    if (this.data.totalCount === 0) {
      wx.showToast({
        title: '请先选择体检项目',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到结算页面
    wx.showToast({
      title: '前往结算页面',
      icon: 'success'
    });
    
    // 实际应用中应该跳转到结算页面
    // wx.navigateTo({
    //   url: '/pages/checkout/checkout'
    // });
  }
});