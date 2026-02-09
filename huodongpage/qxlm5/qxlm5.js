// subpackages/lipin/lipin.js
const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  clickPro() {
    req({
      url: util.baseUrl + "/newapi/api/huodong/givefreeqixicard",
      method: "POST",
      data: {
        proid:2464,
        money: 0,
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '领取成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/subpackages/mycard/mycard',
            })
          }, 2000);
        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },
  getPhoneNumber(e) {
    if (e.detail.iv && e.detail.encryptedData) {
      req({
        url: util.baseUrl + '/aiapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: res => {
          console.log(res.data);
          req({
            url: util.baseUrl + "/aiapi/api/card/getfreecard",
            method: "post",
            data: {
              openid: wx.getStorageSync('openid'),
              mobile: res.data.data
            },
            success: ress => {
              const result = util.isTabBarPage(app.globalData.zhuanfaPage)

              if (ress.data.status) {
                wx.showModal({
                  title: '兑换成功',
                  content: ress.data.msg,
                  showCancel: false,
                  complete: (res) => {
                    wx.navigateBack()
                    // if (result) {
                    //   wx.switchTab({
                    //     url: "/" + app.globalData.zhuanfaPage,
                    //   })
                    // } else {
                    //   wx.navigateBack({
                    //     url: "/" + app.globalData.zhuanfaPage
                    //   })
                    // }
                  }
                })
                
              } else {
                wx.showModal({
                  title: '提示',
                  content: ress.data.data,
                  showCancel: false,
                  complete: (res) => {
                    wx.navigateBack()
                  }
                })
              }
            }
          })

        }
      })
    }
  },
  initCanvas: function () {
    const query = wx.createSelectorQuery();
    query.select('#animCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 设置canvas大小
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 动画循环 - 只保留光束效果
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 绘制光束效果
          this.drawLightBeams(ctx, canvas.width, canvas.height);

          this.timer = setTimeout(animate, 16); // 约60fps的刷新率
        };

        animate();
      });
  },

  drawLightBeams: function (ctx, width, height) {
    const time = Date.now() / 1000;
    const lightSources = [{
        x: 0,
        y: 0
      },
      {
        x: width,
        y: 0
      },
      {
        x: 0,
        y: height
      },
      {
        x: width,
        y: height
      },
      {
        x: width / 2,
        y: height / 2
      }
    ];

    lightSources.forEach((source, sourceIndex) => {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time + sourceIndex * 0.5;
        const gradient = ctx.createLinearGradient(
          source.x,
          source.y,
          source.x + Math.cos(angle) * width * 0.8,
          source.y + Math.sin(angle) * height * 0.8
        );

        const alpha = (Math.sin(time * 2 + sourceIndex) + 1) * 0.3 + 0.2;
        gradient.addColorStop(0, `rgba(255, 223, 186, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 223, 186, 0)');

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(
          source.x + Math.cos(angle) * width * 0.8,
          source.y + Math.sin(angle) * height * 0.8
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 15;
        ctx.stroke();
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

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
    // 清理定时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
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
})