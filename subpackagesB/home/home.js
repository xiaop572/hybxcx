// subpackagesB/home/home.js
let timer = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  intervalTime(startTime, endTime) {
    // var timestamp=new Date().getTime(); //计算当前时间戳
    var timestamp = Date.parse(new Date()) / 1000; //计算当前时间戳 (毫秒级)
    var date1 = ""; //开始时间
    if (timestamp < startTime) {
      date1 = startTime;
    } else {
      date1 = timestamp; //开始时间
    }
    var date2 = endTime; //结束时间
    // var date3 = date2.getTime() - date1.getTime(); //时间差的毫秒数
    var date3 = date2 - date1; //时间差的毫秒数

    if (date3 < 0) {
      return false;
    }
    //计算出相差天数
    var days = Math.floor(date3 / (24 * 3600 * 1000));
    //计算出小时数

    var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000));

    //计算相差秒数

    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000);
    return [days, hours, minutes, seconds];
    //return   days + "天 " + hours + "小时 "
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  rricheng() {
    wx.navigateTo({
      url: '../richeng/richeng',
    })
  },
  rhylist() {
    wx.navigateTo({
      url: '../hylist/hylist',
    })
  },
  rhslwzj(){
    wx.navigateTo({
      url: '../hslwzjnr/hslwzjnr',
    })
  },
  rdhzjjg(){
    wx.navigateTo({
      url: '../dhzjjgnr/dhzjjgnr',
    })
  },
  rtupage(e) {
    let data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../' + data.type + '/' + data.type,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    timer = setInterval(() => {
      let result = this.intervalTime(
        new Date().getTime(),
        new Date("2024-10-25").getTime()
      );
      this.setData({
        day: result[0],
        hour: result[1],
        minute: result[2],
        seconds: result[3]
      })
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(timer)
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