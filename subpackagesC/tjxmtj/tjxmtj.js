// subpackagesC/tjxmtj/tjxmtj.js
Page({
  data: {
    // 问卷数据
    surveyData: null,
    // 用户的回答
    userAnswers: {},
    // 推荐的体检项目
    recommendedItems: [
    ],
    // 已选项目总价
    totalPrice: 0,
    // 购物车中的项目数量
    cartCount: 0,
    // 分类数据
    categories: [
      { id: 7, name: '已选项目', icon: '✅', badge: 0 },
      { id: 1, name: '一般检查', icon: '🧪', badge: 0 },
      { id: 2, name: '耳鼻喉科体', icon: '👂', badge: 0 },
      { id: 3, name: '口腔科体检', icon: '🦷', badge: 0 },
      { id: 4, name: '眼科体检', icon: '👁️', badge: 0 },
      { id: 5, name: '体液检查', icon: '🩸', badge: 1 },
      { id: 6, name: '其他检查', icon: '🏥', badge: 1 },
    ],
    // 当前选中的分类
    currentCategory: 1,
    // 筛选后的项目
    filteredItems: []
  },

  onLoad: function (options) {
    // 解析问卷数据
    this.loadSurveyData();
    
    // 初始化推荐项目
    this.initRecommendedItems();
    
    // 计算初始总价
    this.calculateTotalPrice();
    
    // 初始化购物车数量
    this.updateCartCount();
    
    // 初始化筛选项目
    this.filterItemsByCategory(this.data.currentCategory);
  },
  
  // 加载问卷数据
  loadSurveyData: function() {
    // 模拟从API获取的问卷数据
    const surveyData = {
      "title": "问卷调查",
      "description": "请填写以下问卷",
      "questions": [
        {
          "id": 1,
          "text": "您的年龄范围？",
          "options": [
            "18-25岁",
            "26-35岁",
            "36-45岁",
            "46岁以上"
          ]
        },
        {
          "id": 2,
          "text": "您的职业？",
          "options": [
            "学生",
            "上班族",
            "自由职业",
            "其他"
          ]
        }
      ]
    };
    
    // 模拟用户回答
    const userAnswers = {
      1: "26-35岁",
      2: "上班族"
    };
    
    this.setData({
      surveyData: surveyData,
      userAnswers: userAnswers
    });
  },
  
  // 初始化推荐项目
  initRecommendedItems: function() {
    // 从本地缓存中获取推荐项目数据
    const recommendedItems = wx.getStorageSync('recommendedItems');
    
    if (recommendedItems && recommendedItems.length > 0) {
      // 如果缓存中有推荐项目数据，则使用缓存数据
      this.setData({
        recommendedItems: recommendedItems
      });
      
      // 清除缓存，避免影响下次使用
      wx.removeStorageSync('recommendedItems');
      
      console.log('从缓存加载推荐项目数据:', recommendedItems);
    } else {
      // 如果缓存中没有数据，则使用默认数据（当前已在data中定义）
      console.log('使用默认推荐项目数据');
    }
  },
  
  // 切换分类
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      currentCategory: categoryId
    });
    
    // 根据分类筛选显示项目
    this.filterItemsByCategory(categoryId);
  },
  
  // 根据分类筛选项目
  filterItemsByCategory: function(categoryId) {
    const allItems = this.data.recommendedItems;
    let filteredItems;
    
    if (categoryId === 7) { // 已选项目分类
      filteredItems = allItems.filter(item => item.isSelected);
    } else {
      filteredItems = allItems.filter(item => item.categoryId === categoryId);
    }
    
    this.setData({
      filteredItems: filteredItems
    });
  },

  // 选择/取消选择项目
  toggleItem: function(e) {
    const itemId = e.currentTarget.dataset.id;
    const recommendedItems = this.data.recommendedItems;
    let filteredItems = this.data.filteredItems || [];
    
    // 找到对应项目并切换选中状态
    for (let i = 0; i < recommendedItems.length; i++) {
      if (recommendedItems[i].id === itemId) {
        recommendedItems[i].isSelected = !recommendedItems[i].isSelected;
        break;
      }
    }
    
    // 同步更新filteredItems中的选中状态
    if (filteredItems.length > 0) {
      filteredItems = filteredItems.map(item => {
        const originalItem = recommendedItems.find(original => original.id === item.id);
        if (originalItem) {
          return {...item, isSelected: originalItem.isSelected};
        }
        return item;
      });
    }
    
    this.setData({
      recommendedItems: recommendedItems,
      filteredItems: filteredItems
    });
    
    // 更新购物车数量和总价
    this.updateCartCount();
    this.calculateTotalPrice();
  },

  // 更新购物车数量
  updateCartCount: function() {
    // 计算购物车中的项目数量
    const cartCount = this.data.recommendedItems.filter(item => item.isSelected).length;
    
    // 更新已选项目分类的badge
    const categories = this.data.categories;
    categories[0].badge = cartCount;
    
    this.setData({
      cartCount: cartCount,
      categories: categories
    });
  },
  
  // 计算总价
  calculateTotalPrice: function() {
    let total = 0;
    const recommendedItems = this.data.recommendedItems;
    
    for (let i = 0; i < recommendedItems.length; i++) {
      if (recommendedItems[i].isSelected) {
        total += recommendedItems[i].price;
      }
    }
    
    this.setData({
      totalPrice: total.toFixed(2)
    });
  },

  // 确认选择，跳转到体检项目页面
  confirmSelection: function() {
    // 获取已选项目
    const selectedItems = this.data.recommendedItems.filter(item => item.isSelected);
    
    // 可以将选中的项目通过事件或全局数据传递给下一页
    wx.navigateTo({
      url: '/subpackagesC/tjxm/tjxm'
    });
  },

  // 取消选择，返回上一页
  cancelSelection: function() {
    wx.navigateBack();
  }
})