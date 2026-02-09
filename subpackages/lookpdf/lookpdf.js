// subpackages/lookpdf/lookpdf.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },
  downpdf(){
    const FileSystemManager = wx.getFileSystemManager()
    wx.downloadFile({
      // 示例 url，并非真实存在
      url: 'https://wx.pmc-wz.com/materials/choubeihui.pdf',
      success: function (res) {
        const filePath = res.tempFilePath
        FileSystemManager.saveFile({
          tempFilePath:filePath,
          success:(res)=>{
            console.log(res,"成功")
          },
          fail:(res)=>{
            console.log(res,"失败")
          }
        })
      }
    })
  },
  lookpdf(){
    wx.downloadFile({
      // 示例 url，并非真实存在
      url: 'https://wx.pmc-wz.com/tjpdf/2023/01/06/3000027045/2023-01-07_3000027045.PDF',
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          showMenu:true,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
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

  }
})