// subpackages/medical-survey/index.js
Page({
  data: {
    // 页面数据
  },

  onLoad: function(options) {
    // 页面加载时执行
  },

  navigateToPage: function(e) {
    const page = e.currentTarget.dataset.page;
    let targetUrl = '';
    
    // 根据点击的卡片跳转到不同页面
    switch(page) {
      case 'weight-survey':
        targetUrl = '/subpackagesC/weight-survey/weight-survey';
        break;
      case 'diet-habit':
        targetUrl = '/subpackagesC/diet-survey/diet-survey';
        break;
      case 'jzzn':
        targetUrl = '/subpackagesC/jzzn/jzzn';
        break;
      case 'fpsc':
        targetUrl = '/huodongpage/fpsc/fpsc';
        break;
      case 'tsal':
        targetUrl = '/subpackagesC/tsal/tsal';
        break;
      default:
        return;
    }
    
    wx.navigateTo({
      url: targetUrl
    });
  }
})