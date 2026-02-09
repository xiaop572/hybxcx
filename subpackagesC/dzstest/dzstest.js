Page({
  data: {
    // 基础数据
    currentPage: 0,
    totalPages: 0,
    isLoading: true,
    loadedCount: 0,
    
    // 触摸相关
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
    isFlipping: false,
    
    // 3D翻页动画相关
    currentPageClass: '',
    nextPageClass: '',
    prevPageClass: '',
    
    // 预览页面内容控制（避免动画过程中内容闪烁）
    nextPreviewPage: -1,
    prevPreviewPage: -1,
    
    // 卷角拖拽相关
    cornerDragClass: '',
    cornerTransform: '',
    cornerFoldTransform: '',
    isCornerDragging: false,
    cornerStartX: 0,
    cornerStartY: 0,
    
    // 图片资源
    imageUrls: [
      'https://wx.pmc-wz.com/materials/dzhc/001.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/11.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/22.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/33.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/44.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/55.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/66.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/77.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/88.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/99.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/100.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/101.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/102.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/103.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/104.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/105.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/106.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/107.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/108.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/109.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/110.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/111.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/112.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/113.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/114.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/115.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/116.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/117.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/118.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/119.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/120.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/121.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/122.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/123.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/124.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/125.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/126.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/127.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/128.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/129.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/130.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/131.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/132.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/133.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/134.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/135.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/136.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/137.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/138.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/139.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/140.jpg',
      'https://wx.pmc-wz.com/materials/dzhc/141.jpg',
    ]
  },

  onLoad(options) {
    let that = this;
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id = arr[1]
    }
    if (options.sponsor) {
      wx.setStorageSync('sponsor', options.sponsor)
    }
    
    // 初始化性能监控
    this.initPerformanceMonitor();
    
    // 检测网络状态
    this.checkNetworkStatus();
    
    // 开始预加载
    this.initializeBook();
  },

  // 初始化性能监控
  initPerformanceMonitor() {
    this.performanceData = {
      startTime: Date.now(),
      imageLoadTimes: [],
      cacheHitRate: 0,
      totalRequests: 0,
      cacheHits: 0,
      errors: []
    };
  },

  // 检测网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        console.log('网络类型:', networkType);
        
        // 根据网络状态调整预加载策略
        if (networkType === 'wifi') {
          this.smartPreloader.maxConcurrent = 3;
          this.imageCache.maxMemorySize = 80;
        } else if (networkType === '4g') {
          this.smartPreloader.maxConcurrent = 2;
          this.imageCache.maxMemorySize = 50;
        } else {
          this.smartPreloader.maxConcurrent = 1;
          this.imageCache.maxMemorySize = 30;
        }
        
        this.setData({ networkType });
      },
      fail: () => {
        console.warn('获取网络状态失败');
        // 默认保守策略
        this.smartPreloader.maxConcurrent = 1;
        this.imageCache.maxMemorySize = 30;
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      console.log('网络状态变化:', res);
      if (res.isConnected) {
        this.checkNetworkStatus();
        // 网络恢复后重试失败的请求
        this.retryFailedRequests();
      } else {
        // 网络断开时暂停预加载
        this.smartPreloader.clear();
      }
    });
  },

  // 重试失败的请求
  retryFailedRequests() {
    const failedUrls = this.performanceData.errors
      .filter(error => error.type === 'network')
      .map(error => error.url);
    
    if (failedUrls.length > 0) {
      console.log('重试失败的图片:', failedUrls.length);
      this.smartPreloader.add(failedUrls, 60);
      
      // 清除已重试的错误记录
      this.performanceData.errors = this.performanceData.errors
        .filter(error => error.type !== 'network');
    }
  },

  onUnload() {
    // 输出性能报告
    this.generatePerformanceReport();
    
    // 清理资源
    this.cleanup();
  },

  // 生成性能报告
  generatePerformanceReport() {
    if (!this.performanceData) return;
    
    const { 
      startTime, 
      imageLoadTimes, 
      cacheHitRate, 
      totalRequests, 
      cacheHits, 
      errors 
    } = this.performanceData;
    
    const totalTime = Date.now() - startTime;
    const avgLoadTime = imageLoadTimes.length > 0 
      ? (imageLoadTimes.reduce((sum, item) => sum + item.loadTime, 0) / imageLoadTimes.length).toFixed(2)
      : 0;
    
    const report = {
      '总运行时间': `${(totalTime / 1000).toFixed(2)}秒`,
      '图片请求总数': totalRequests,
      '缓存命中数': cacheHits,
      '缓存命中率': `${cacheHitRate}%`,
      '平均加载时间': `${avgLoadTime}ms`,
      '加载错误数': errors.length,
      '内存缓存大小': this.imageCache.memory.size,
      '网络类型': this.data.networkType || '未知'
    };
    
    console.log('📊 图片加载性能报告:', report);
    
    // 如果错误率过高，给出建议
    const errorRate = totalRequests > 0 ? (errors.length / totalRequests * 100).toFixed(2) : 0;
    if (errorRate > 10) {
      console.warn(`⚠️ 图片加载错误率较高 (${errorRate}%)，建议检查网络状况或图片资源`);
    }
    
    // 如果缓存命中率过低，给出建议
    if (parseFloat(cacheHitRate) < 30 && totalRequests > 10) {
      console.warn(`⚠️ 缓存命中率较低 (${cacheHitRate}%)，建议增加缓存大小或优化预加载策略`);
    }
  },

  // 获取缓存统计信息
  getCacheStats() {
    const memorySize = this.imageCache.memory.size;
    let storageSize = 0;
    
    try {
      const storageCache = wx.getStorageSync(this.imageCache.storage) || {};
      storageSize = Object.keys(storageCache).length;
    } catch (e) {
      console.warn('获取存储缓存大小失败:', e);
    }
    
    return {
      memoryCache: {
        size: memorySize,
        maxSize: this.imageCache.maxMemorySize,
        usage: `${((memorySize / this.imageCache.maxMemorySize) * 100).toFixed(1)}%`
      },
      storageCache: {
        size: storageSize,
        maxSize: this.imageCache.maxStorageSize,
        usage: `${((storageSize / this.imageCache.maxStorageSize) * 100).toFixed(1)}%`
      },
      preloadQueue: {
        pending: this.smartPreloader.preloadQueue.length,
        concurrent: this.smartPreloader.currentConcurrent,
        maxConcurrent: this.smartPreloader.maxConcurrent
      }
    };
  },

  // 初始化书本
  initializeBook() {
    const { imageUrls } = this.data;
    this.setData({
      totalPages: imageUrls.length,
      isLoading: true,
      loadedCount: 0,
      // 初始化预览页面变量
      nextPreviewPage: imageUrls.length > 1 ? 1 : -1,
      prevPreviewPage: -1
    });
    
    // 初始化智能预加载器
    this.smartPreloader.init(this);
    
    this.preloadImages();
  },

  // 图片缓存管理器
  imageCache: {
    memory: new Map(), // 内存缓存
    storage: 'dzhc_image_cache', // 本地存储key
    maxMemorySize: 50, // 最大内存缓存数量
    maxStorageSize: 100, // 最大本地存储缓存数量
    
    // 获取缓存的图片信息
    get(url) {
      // 先检查内存缓存
      if (this.memory.has(url)) {
        const cached = this.memory.get(url);
        cached.lastAccess = Date.now();
        return cached;
      }
      
      // 检查本地存储缓存
      try {
        const storageCache = wx.getStorageSync(this.storage) || {};
        if (storageCache[url]) {
          const cached = storageCache[url];
          cached.lastAccess = Date.now();
          // 移到内存缓存
          this.memory.set(url, cached);
          return cached;
        }
      } catch (e) {
        console.warn('读取图片缓存失败:', e);
      }
      
      return null;
    },
    
    // 设置缓存
    set(url, info) {
      const cacheItem = {
        url,
        info,
        timestamp: Date.now(),
        lastAccess: Date.now()
      };
      
      // 添加到内存缓存
      this.memory.set(url, cacheItem);
      
      // 清理内存缓存
      this.cleanMemoryCache();
      
      // 添加到本地存储缓存
      this.saveToStorage(url, cacheItem);
    },
    
    // 清理内存缓存
    cleanMemoryCache() {
      if (this.memory.size <= this.maxMemorySize) return;
      
      // 按最后访问时间排序，删除最久未访问的
      const entries = Array.from(this.memory.entries())
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
      
      const deleteCount = this.memory.size - this.maxMemorySize;
      for (let i = 0; i < deleteCount; i++) {
        this.memory.delete(entries[i][0]);
      }
    },
    
    // 保存到本地存储
    saveToStorage(url, cacheItem) {
      try {
        let storageCache = wx.getStorageSync(this.storage) || {};
        storageCache[url] = cacheItem;
        
        // 清理本地存储缓存
        const urls = Object.keys(storageCache);
        if (urls.length > this.maxStorageSize) {
          const sortedUrls = urls
            .map(u => ({ url: u, lastAccess: storageCache[u].lastAccess }))
            .sort((a, b) => a.lastAccess - b.lastAccess);
          
          const deleteCount = urls.length - this.maxStorageSize;
          for (let i = 0; i < deleteCount; i++) {
            delete storageCache[sortedUrls[i].url];
          }
        }
        
        wx.setStorageSync(this.storage, storageCache);
      } catch (e) {
        console.warn('保存图片缓存失败:', e);
      }
    },
    
    // 清理过期缓存
    cleanExpired() {
      const now = Date.now();
      const expireTime = 7 * 24 * 60 * 60 * 1000; // 7天过期
      
      try {
        let storageCache = wx.getStorageSync(this.storage) || {};
        let hasChanges = false;
        
        Object.keys(storageCache).forEach(url => {
          if (now - storageCache[url].timestamp > expireTime) {
            delete storageCache[url];
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          wx.setStorageSync(this.storage, storageCache);
        }
      } catch (e) {
        console.warn('清理过期缓存失败:', e);
      }
    }
  },

  // 智能预加载策略
  smartPreloader: {
    preloadQueue: [], // 预加载队列
    loading: false, // 是否正在加载
    maxConcurrent: 2, // 最大并发数
    currentConcurrent: 0, // 当前并发数
    pageInstance: null, // 页面实例引用
    
    // 初始化
    init(pageInstance) {
      this.pageInstance = pageInstance;
    },
    
    // 添加到预加载队列
    add(urls, priority = 0) {
      const newItems = urls.map(url => ({ url, priority, added: Date.now() }));
      this.preloadQueue.push(...newItems);
      
      // 按优先级排序
      this.preloadQueue.sort((a, b) => b.priority - a.priority);
      
      // 开始处理队列
      this.processQueue();
    },
    
    // 处理预加载队列
    async processQueue() {
      if (this.loading || this.currentConcurrent >= this.maxConcurrent) return;
      if (this.preloadQueue.length === 0) return;
      
      this.loading = true;
      
      while (this.preloadQueue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
        const item = this.preloadQueue.shift();
        this.loadImage(item.url);
      }
      
      this.loading = false;
    },
    
    // 加载单张图片
    async loadImage(url) {
      this.currentConcurrent++;
      const startTime = Date.now();
      const pageInstance = this.pageInstance;
      
      try {
        // 更新性能统计
        if (pageInstance && pageInstance.performanceData) {
          pageInstance.performanceData.totalRequests++;
        }
        
        // 检查缓存
        const cached = pageInstance ? pageInstance.imageCache.get(url) : null;
        if (cached) {
          console.log('图片已缓存:', url);
          
          // 更新缓存命中率
          if (pageInstance && pageInstance.performanceData) {
            pageInstance.performanceData.cacheHits++;
            pageInstance.performanceData.cacheHitRate = 
              (pageInstance.performanceData.cacheHits / pageInstance.performanceData.totalRequests * 100).toFixed(2);
          }
          
          return cached.info;
        }
        
        // 加载图片
        const info = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('图片加载超时'));
          }, 10000); // 10秒超时
          
          wx.getImageInfo({
            src: url,
            success: (res) => {
              clearTimeout(timeout);
              resolve(res);
            },
            fail: (err) => {
              clearTimeout(timeout);
              reject(err);
            }
          });
        });
        
        // 保存到缓存
        if (pageInstance) {
          pageInstance.imageCache.set(url, info);
        }
        
        // 记录加载时间
        const loadTime = Date.now() - startTime;
        if (pageInstance && pageInstance.performanceData) {
          pageInstance.performanceData.imageLoadTimes.push({
            url,
            loadTime,
            timestamp: Date.now()
          });
        }
        
        console.log(`图片预加载成功: ${url} (${loadTime}ms)`);
        return info;
        
      } catch (error) {
        console.warn('图片预加载失败:', url, error);
        
        // 记录错误
        if (pageInstance && pageInstance.performanceData) {
          pageInstance.performanceData.errors.push({
            url,
            error: error.message,
            type: error.message.includes('网络') || error.message.includes('timeout') ? 'network' : 'other',
            timestamp: Date.now()
          });
        }
        
        return null;
      } finally {
        this.currentConcurrent--;
        
        // 继续处理队列
        setTimeout(() => this.processQueue(), 100);
      }
    },
    
    // 清空队列
    clear() {
      this.preloadQueue = [];
    }
  },

  // 优化的预加载图片 - 智能预加载策略
  preloadImages() {
    const { imageUrls, currentPage } = this.data;
    
    // 清理过期缓存
    this.imageCache.cleanExpired();
    
    // 计算预加载范围
    const preloadRange = this.calculatePreloadRange(currentPage, imageUrls.length);
    
    // 分优先级预加载
    const highPriorityUrls = []; // 当前页和相邻页
    const mediumPriorityUrls = []; // 附近几页
    const lowPriorityUrls = []; // 其他页面
    
    imageUrls.forEach((url, index) => {
      const distance = Math.abs(index - (currentPage - 1));
      
      if (distance === 0) {
        highPriorityUrls.push(url); // 当前页最高优先级
      } else if (distance <= 1) {
        highPriorityUrls.push(url); // 相邻页高优先级
      } else if (distance <= 3) {
        mediumPriorityUrls.push(url); // 附近页中等优先级
      } else if (preloadRange.includes(index)) {
        lowPriorityUrls.push(url); // 预加载范围内低优先级
      }
    });
    
    // 按优先级添加到预加载队列
    this.smartPreloader.add(highPriorityUrls, 100);
    this.smartPreloader.add(mediumPriorityUrls, 50);
    this.smartPreloader.add(lowPriorityUrls, 10);
    
    // 快速加载当前页
    this.loadCurrentPageImages().then(() => {
      this.setupPages();
      this.setData({ isLoading: false });
    });
  },

  // 计算预加载范围
  calculatePreloadRange(currentPage, totalPages) {
    const range = [];
    const preloadDistance = 5; // 预加载前后5页
    
    const start = Math.max(0, currentPage - 1 - preloadDistance);
    const end = Math.min(totalPages - 1, currentPage - 1 + preloadDistance);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  },

  // 快速加载当前页图片
  async loadCurrentPageImages() {
    const { imageUrls, currentPage } = this.data;
    const currentIndex = currentPage - 1;
    
    if (currentIndex >= 0 && currentIndex < imageUrls.length) {
      const url = imageUrls[currentIndex];
      
      try {
        // 检查缓存
        let cached = this.imageCache.get(url);
        if (cached) {
          console.log('当前页图片已缓存');
          return cached.info;
        }
        
        // 立即加载当前页图片
        const info = await new Promise((resolve, reject) => {
          wx.getImageInfo({
            src: url,
            success: resolve,
            fail: reject
          });
        });
        
        // 保存到缓存
        this.imageCache.set(url, info);
        console.log('当前页图片加载完成');
        
        return info;
      } catch (error) {
        console.warn('当前页图片加载失败:', error);
        return null;
      }
    }
  },

  // 设置页面数据
  setupPages() {
    // 页面设置已简化，主要依赖CSS动画
  },

  // 图片加载成功回调
  onImageLoad(e) {
    console.log('图片加载成功:', e.detail);
  },

  // 图片加载失败回调
  onImageError(e) {
    console.warn('图片加载失败:', e.detail);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 1500
    });
  },

  // 已移除getPageTransform和getPageOpacity方法，使用CSS动画

  // 触摸开始
  onTouchStart(e) {
    if (this.data.isFlipping) return;
    
    // 确保清除之前的触摸状态
    this.resetTouchState();
    
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  },

  // 触摸移动
  onTouchMove(e) {
    if (this.data.isFlipping || !this.touchStartX || this.touchStartTime === null) return;
    
    const touch = e.touches[0];
    if (!touch) {
      this.resetTouchState();
      return;
    }
    
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // 防止垂直滚动时触发翻页，但允许轻微的垂直偏移
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
      this.resetTouchState();
      return;
    }
    
    // 处理页面预览
    this.handlePagePreview(deltaX);
  },

  // 触摸结束
  onTouchEnd(e) {
    if (this.data.isFlipping || !this.touchStartX || this.touchStartTime === null) return;
    
    const touch = e.changedTouches[0];
    if (!touch) {
      this.resetTouchState();
      return;
    }
    
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;
    
    // 防止垂直滚动时触发翻页，但允许轻微的垂直偏移
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
      this.resetTouchState();
      this.resetPageStates();
      return;
    }
    
    // 判断是否应该翻页
    const distance = Math.abs(deltaX);
    const velocity = deltaTime > 0 ? distance / deltaTime : 0;
    
    // 统一翻页阈值，避免逻辑冲突
    const minDistance = 30; // 最小滑动距离
    const minVelocity = 0.2; // 最小滑动速度
    const fastSwipeDistance = 20; // 快速滑动时的最小距离
    
    // 判断翻页条件：距离足够 或 速度足够快
    const shouldFlip = distance >= minDistance || (velocity >= minVelocity && distance >= fastSwipeDistance);
    
    if (shouldFlip) {
      if (deltaX < -fastSwipeDistance && this.data.currentPage < this.data.totalPages - 1) {
        // 向左滑动，下一页
        this.resetTouchState();
        this.nextPage();
      } else if (deltaX > fastSwipeDistance && this.data.currentPage > 0) {
        // 向右滑动，上一页
        this.resetTouchState();
        this.prevPage();
      } else {
        // 重置触摸和页面状态
        this.resetTouchState();
        this.resetPageStates();
      }
    } else {
      // 重置触摸和页面状态
      this.resetTouchState();
      this.resetPageStates();
    }
  },

  // 处理页面预览效果 - 已移除旧的预览逻辑，使用CSS类动画
  handlePagePreview(deltaX) {
    // 不再需要实时预览效果，直接返回
    // 翻页效果完全由CSS动画处理
    return;
  },

  // 重置触摸状态
  resetTouchState() {
    this.touchStartX = null;
    this.touchStartY = null;
    this.touchStartTime = null;
  },

  // 卷角触摸开始
  onCornerTouchStart(e) {
    if (this.data.isFlipping || this.data.currentPage >= this.data.totalPages - 1) return;
    
    const touch = e.touches[0];
    this.setData({
      isCornerDragging: true,
      cornerStartX: touch.clientX,
      cornerStartY: touch.clientY,
      cornerDragClass: 'dragging'
    });
    
    // 阻止事件冒泡，避免触发普通翻页
    e.stopPropagation();
  },

  // 卷角触摸移动
  onCornerTouchMove(e) {
    if (!this.data.isCornerDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.data.cornerStartX;
    const deltaY = touch.clientY - this.data.cornerStartY;
    
    // 限制拖拽范围
    const maxDrag = 120;
    const clampedX = Math.max(-maxDrag, Math.min(0, deltaX));
    const clampedY = Math.max(-maxDrag, Math.min(0, deltaY));
    
    // 计算卷角变形
    const dragDistance = Math.sqrt(clampedX * clampedX + clampedY * clampedY);
    const dragRatio = Math.min(dragDistance / maxDrag, 1);
    
    // 卷角区域变形
    const cornerRotation = dragRatio * 15; // 最大旋转15度
    const cornerScale = 1 + dragRatio * 0.1; // 轻微放大
    
    // 卷角折叠效果
    const foldRotation = dragRatio * 30; // 折叠角度
    const foldScale = 1 + dragRatio * 0.2;
    
    this.setData({
      cornerTransform: `translate(${clampedX}px, ${clampedY}px) rotate(${cornerRotation}deg) scale(${cornerScale})`,
      cornerFoldTransform: `rotate(${foldRotation}deg) scale(${foldScale})`
    });
    
    // 如果拖拽距离足够，显示下一页预览
    if (dragDistance > 60 && this.data.currentPage < this.data.totalPages - 1) {
      this.setData({
        nextPreviewPage: this.data.currentPage + 1
      });
    }
    
    e.stopPropagation();
  },

  // 卷角触摸结束
  onCornerTouchEnd(e) {
    if (!this.data.isCornerDragging) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.data.cornerStartX;
    const deltaY = touch.clientY - this.data.cornerStartY;
    const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 判断是否翻页
    const flipThreshold = 80;
    const shouldFlip = dragDistance > flipThreshold && this.data.currentPage < this.data.totalPages - 1;
    
    if (shouldFlip) {
      // 执行翻页
      this.nextPage();
    }
    
    // 重置卷角状态
    this.resetCornerState();
    
    e.stopPropagation();
  },

  // 重置卷角状态
  resetCornerState() {
    this.setData({
      isCornerDragging: false,
      cornerDragClass: '',
      cornerTransform: '',
      cornerFoldTransform: '',
      cornerStartX: 0,
      cornerStartY: 0,
      nextPreviewPage: -1
    });
  },

  // 重置页面状态
  resetPageStates() {
    // 同时重置卷角状态
    this.resetCornerState();
    
    this.setData({
      isFlipping: false,
      currentPageClass: '',
      nextPageClass: '',
      prevPageClass: ''
    });
  },

  // 下一页
  nextPage() {
    const { currentPage, totalPages, isFlipping } = this.data;
    
    if (isFlipping || currentPage >= totalPages - 1) {
      wx.showToast({ title: '已经是最后一页了', icon: 'none' });
      return;
    }
    
    this.performPageFlip(currentPage + 1, 'next');
    // 触发智能预加载
    this.triggerSmartPreload(currentPage + 1);
  },

  // 上一页
  prevPage() {
    const { currentPage, isFlipping } = this.data;
    
    if (isFlipping || currentPage <= 0) {
      wx.showToast({ title: '已经是第一页了', icon: 'none' });
      return;
    }
    
    this.performPageFlip(currentPage - 1, 'prev');
    // 触发智能预加载
    this.triggerSmartPreload(currentPage - 1);
  },

  // 触发智能预加载
  triggerSmartPreload(newPage) {
    const { imageUrls } = this.data;
    
    // 计算新的预加载范围
    const preloadRange = this.calculatePreloadRange(newPage, imageUrls.length);
    
    // 预加载相邻页面
    const adjacentUrls = [];
    const nearbyUrls = [];
    
    preloadRange.forEach(index => {
      const distance = Math.abs(index - (newPage - 1));
      if (distance <= 1 && index >= 0 && index < imageUrls.length) {
        adjacentUrls.push(imageUrls[index]);
      } else if (distance <= 3 && index >= 0 && index < imageUrls.length) {
        nearbyUrls.push(imageUrls[index]);
      }
    });
    
    // 添加到预加载队列
    this.smartPreloader.add(adjacentUrls, 80);
    this.smartPreloader.add(nearbyUrls, 30);
  },

  // 执行翻页动画
  performPageFlip(targetPage, direction) {
    if (this.data.isFlipping) return;
    
    this.setData({ isFlipping: true });
    
    
    // 执行翻页动画
    if (direction === 'next') {
      this.animateNextPage(targetPage);
    } else {
      this.animatePrevPage(targetPage);
    }
  },

  // 下一页动画 - 书本翻页效果
  animateNextPage(targetPage) {
    // 第一阶段：立即设置下一页预览内容，避免白屏
    this.setData({
      isFlipping: true,
      nextPreviewPage: targetPage,
      nextPageClass: 'sliding-in-next',
      currentPageClass: 'flipping-next'
    });
    
    // 第二阶段：动画中点，切换当前页面数据
    setTimeout(() => {
      this.setData({
        currentPage: targetPage
      });
    }, 600);
    
    // 第三阶段：完成动画并重置状态
    setTimeout(() => {
      this.setData({
        isFlipping: false,
        currentPageClass: '',
        nextPageClass: '',
        // 更新预览页面变量
        nextPreviewPage: targetPage + 1 < this.data.totalPages ? targetPage + 1 : -1,
        prevPreviewPage: targetPage - 1 >= 0 ? targetPage - 1 : -1
      });
      
      // 保存阅读进度
      this.saveReadingProgress();
    }, 1200);
  },

  // 上一页动画 - 书本翻页效果
  animatePrevPage(targetPage) {
    // 第一阶段：立即设置上一页预览内容并开始翻转动画
    this.setData({
      isFlipping: true,
      prevPreviewPage: targetPage,
      prevPageClass: 'sliding-in-prev',
      currentPageClass: 'flipping-prev'
    });
    
    // 第二阶段：动画中点，切换当前页面数据
    setTimeout(() => {
      this.setData({
        currentPage: targetPage
      });
    }, 600);
    
    // 第三阶段：完成动画并重置所有状态
    setTimeout(() => {
      this.setData({
        isFlipping: false,
        currentPageClass: '',
        prevPageClass: '',
        // 更新预览页面变量
        nextPreviewPage: targetPage + 1 < this.data.totalPages ? targetPage + 1 : -1,
        prevPreviewPage: targetPage - 1 >= 0 ? targetPage - 1 : -1
      });
      
      // 保存阅读进度
      this.saveReadingProgress();
    }, 1200);
  },

  // 跳转到指定页面（用于按钮点击）
  jumpToPage(targetPage) {
    if (this.data.isFlipping || targetPage === this.data.currentPage) return;
    
    const direction = targetPage > this.data.currentPage ? 'next' : 'prev';
    this.performPageFlip(targetPage, direction);
  },

  // 播放翻页音效
  playFlipSound() {
    try {
      const audioContext = wx.createInnerAudioContext();
      audioContext.src = '/static/sounds/page-flip.mp3'; // 需要添加音效文件
      audioContext.volume = 0.3;
      audioContext.play();
      
      audioContext.onEnded(() => {
        audioContext.destroy();
      });
    } catch (error) {
      console.log('音效播放失败:', error);
    }
  },

  // 跳转到指定页面
  jumpToPage(pageNumber) {
    if (pageNumber < 0 || pageNumber >= this.data.totalPages) return;
    
    const direction = pageNumber > this.data.currentPage ? 'forward' : 'backward';
    this.flipToPage(pageNumber, direction);
  },

  // 获取当前阅读进度
  getReadingProgress() {
    const { currentPage, totalPages } = this.data;
    return Math.round(((currentPage + 1) / totalPages) * 100);
  },

  // 保存阅读进度
  saveReadingProgress() {
    const { currentPage } = this.data;
    try {
      wx.setStorageSync('reading_progress', {
        currentPage,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('保存阅读进度失败:', error);
    }
  },

  // 恢复阅读进度
  restoreReadingProgress() {
    try {
      const progress = wx.getStorageSync('reading_progress');
      if (progress && progress.currentPage !== undefined) {
        this.setData({ currentPage: progress.currentPage });
        this.setupPages();
        console.log('恢复阅读进度:', progress.currentPage);
      }
    } catch (error) {
      console.error('恢复阅读进度失败:', error);
    }
  },

  // 清理资源
  cleanup() {
    // 保存阅读进度
    this.saveReadingProgress();
    
    // 清理定时器
    if (this.flipTimer) {
      clearTimeout(this.flipTimer);
      this.flipTimer = null;
    }
    
    console.log('资源清理完成');
  },

  // 错误处理
  handleError(error, context = '') {
    console.error(`错误 [${context}]:`, error);
    
    wx.showToast({
      title: '操作失败，请重试',
      icon: 'none',
      duration: 2000
    });
    
    // 重置状态
    this.setData({ isFlipping: false });
  },
  onShareAppMessage(e) {
    return {
      title: "和平国际医院，30余年品牌沉淀，三级高端医疗。",
      imageUrl: "https://wx.pmc-wz.com/materials/dzhc/fxt.jpg",
      path: '/subpackagesC/dzhc/dzhc?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline(e) {
    return {
      title: "和平国际医院，30余年品牌沉淀，三级高端医疗。",
      imageUrl: "https://wx.pmc-wz.com/materials/dzhc/fxt.jpg",
      path: '/subpackagesC/dzhc/dzhc?fromid=' + wx.getStorageSync('openid'),
    }
  }
});