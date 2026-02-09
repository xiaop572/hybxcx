// subpackagesC/tjxm/tjxm.js
Page({
  data: {
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
    // 体检项目数据
    examItems: [
      {
        id: 1,
        categoryId: 1,
        name: '碳13呼气试验（幽门螺旋杆菌）',
        desc: '了解有无幽门螺旋菌感染，幽门螺旋菌是引起胃溃疡、十二指肠溃疡、非溃疡性消化不良的危险因素。',
        price: 190.00,
        isRecommend: true,
        isApplicable: true,
        isSelected: true
      },
      {
        id: 2,
        categoryId: 1,
        name: '腹部彩超：肝、胆、胰、脾、双肾',
        desc: '了解腹腔脏器的大小、结构是否正常，有无结石、炎症、肿物等疾病。',
        price: 108.00,
        isRecommend: true,
        isApplicable: true,
        isSelected: true
      },
      {
        id: 3,
        categoryId: 5,
        name: '血常规（五分类）',
        desc: '了解有无感染、贫血、凝血功能障碍及血液病。',
        price: 19.00,
        isRecommend: true,
        isApplicable: true,
        isSelected: true
      },
      {
        id: 4,
        categoryId: 5,
        name: '大便常规+隐血',
        desc: '检查消化系统有无炎症、寄生虫感染及恶性肿瘤等，通过检测粪便中的红细胞或血红蛋白，对检查消化道出血有重要的指标。',
        price: 29.20,
        isRecommend: true,
        isApplicable: true,
        isSelected: false
      }
    ],
    // 已选项目总价
    totalPrice: 0
  },

  onLoad: function (options) {
    // 计算初始总价
    this.calculateTotalPrice();
    
    // 初始化购物车数量
    const cartCount = this.data.examItems.filter(item => item.isSelected).length;
    this.setData({
      cartCount: cartCount
    });
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
    const allItems = this.data.examItems;
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
    const examItems = this.data.examItems;
    let filteredItems = this.data.filteredItems || [];
    
    // 找到对应项目并切换选中状态
    for (let i = 0; i < examItems.length; i++) {
      if (examItems[i].id === itemId) {
        examItems[i].isSelected = !examItems[i].isSelected;
        break;
      }
    }
    
    // 同步更新filteredItems中的选中状态
    if (filteredItems.length > 0) {
      filteredItems = filteredItems.map(item => {
        const originalItem = examItems.find(original => original.id === item.id);
        if (originalItem) {
          return {...item, isSelected: originalItem.isSelected};
        }
        return item;
      });
    }
    
    // 计算购物车中的项目数量
    const cartCount = examItems.filter(item => item.isSelected).length;
    
    // 更新已选项目分类的badge
    const categories = this.data.categories;
    categories[6].badge = cartCount;
    
    this.setData({
      examItems: examItems,
      filteredItems: filteredItems,
      cartCount: cartCount,
      categories: categories
    });
    
    // 重新计算总价
    this.calculateTotalPrice();
  },

  // 计算总价
  calculateTotalPrice: function() {
    let total = 0;
    const examItems = this.data.examItems;
    
    for (let i = 0; i < examItems.length; i++) {
      if (examItems[i].isSelected) {
        total += examItems[i].price;
      }
    }
    
    this.setData({
      totalPrice: total.toFixed(2)
    });
  },

  // 搜索项目
  searchItem: function(e) {
    const keyword = e.detail.value;
    // 实现搜索逻辑
  },

  // 确认选择，返回上一页
  confirmSelection: function() {
    // 获取已选项目
    const selectedItems = this.data.examItems.filter(item => item.isSelected);
    
    // 可以将选中的项目通过事件或全局数据传递给上一页
    // 这里简单处理，直接返回上一页
    wx.navigateBack();
  },

  // 取消选择，返回上一页
  cancelSelection: function() {
    wx.navigateBack();
  }
})