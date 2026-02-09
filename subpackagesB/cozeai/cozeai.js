// subpackagesB/cozeai/cozeai.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatMode: "bot", // bot 表示使用agent，model 表示使用大模型
    showBotAvatar: true, // 是否在对话框左侧显示头像
    agentConfig: {
      botId: "bot-ca5cf9c5", // coze agent id
      allowWebSearch: false, // 允许客户端选择启用联网搜索
      allowUploadFile: false, // 允许上传文件
      allowPullRefresh: false, // 允许下拉刷新
      allowUploadImage: false, // 允许上传图片
    },
    modelConfig: {
      modelProvider: "Coze AI",
      welcomeMsg: "你好，我是Coze AI助手，有什么可以帮助你的？",
      logo: "/subpackagesB/cozeai/images/coze-logo.png"
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 可以从options中获取参数，例如botId等
    if (options.botId) {
      this.setData({
        'agentConfig.botId': options.botId
      });
    }
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
  onShareAppMessage() {
    return {
      title: 'Coze AI助手',
      path: '/subpackagesB/cozeai/cozeai'
    }
  }
})