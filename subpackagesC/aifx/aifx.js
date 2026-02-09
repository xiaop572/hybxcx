// subpackagesC/aifx/aifx.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    aifxtext: '',
    name: '',
    serialno: '',
    myDate: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从页面参数中获取AI分析内容
    if (options.aifxtext) {
      // 解码传递的内容
      const aifxtext = decodeURIComponent(options.aifxtext);
      // 格式化文本，处理换行
      const formattedText = this.formatText(aifxtext);
      
      this.setData({
        aifxtext: formattedText,
        name: decodeURIComponent(options.name) || '',
        serialno: options.serialno || '',
        myDate: options.myDate || ''
      });
    }
  },

  /**
   * 格式化文本，处理特殊格式
   */
  formatText(text) {
    // 处理换行
    let formatted = text.replace(/\n/g, '<br>');
    
    // 处理标题格式 (例如：## 标题)
    formatted = formatted.replace(/##\s+([^\n<]+)/g, '<div class="title-level-2">$1</div>');
    formatted = formatted.replace(/#\s+([^\n<]+)/g, '<div class="title-level-1">$1</div>');
    
    // 处理列表项 (例如：- 列表项)
    formatted = formatted.replace(/\-\s+([^\n<]+)/g, '<div class="list-item">• $1</div>');
    
    // 处理强调文本 (例如：**文本**)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<span class="bold">$1</span>');
    
    return formatted;
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  }
})