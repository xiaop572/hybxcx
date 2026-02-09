// huodongpage/ysjzj/ysjzj.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    department: '',
    doctorName: '',
    thankLetter: '',
    imageUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 选择图片
   */
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 先显示本地图片
        this.setData({
          imageUrl: tempFilePath
        });
        // 上传图片到服务器
        this.uploadImage(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 上传图片到服务器
   */
  uploadImage(filePath) {
    wx.showLoading({
      title: '上传中...'
    });

    wx.uploadFile({
      filePath: filePath,
      name: 'file', //这个随便填
      url: util.baseUrl + '/newapi/api/youx/upload', //填写自己服务器的地址。
      header: {
        "Content-Type": "multipart/form-data", //必须是这个格式
        Authorization: 'Bearer ' + wx.getStorageSync('token')
      },
      formData: {},
      success: (res) => {
        wx.hideLoading();
        try {
          const data = JSON.parse(res.data);
          console.log('上传响应:', data);
          if (data.status && data.data && data.data.list && data.data.list.length > 0) {
            // 上传成功，更新图片URL为服务器返回的URL
            this.setData({
              imageUrl: data.data.list[0].file_path
            });
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
          } else {
            throw new Error(data.message || '上传失败或响应格式错误');
          }
        } catch (error) {
          console.error('上传响应解析失败:', error);
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传图片失败:', err);
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 提交表单
   */
  submitForm() {
    // 验证必填字段
    if (!this.data.department) {
      wx.showToast({
        title: '请填写医生科室',
        icon: 'none'
      });
      return;
    }
    if (!this.data.doctorName) {
      wx.showToast({
        title: '请填写医生姓名',
        icon: 'none'
      });
      return;
    }
    if (!this.data.thankLetter) {
      wx.showToast({
        title: '请填写感谢信内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...'
    });

    // 准备提交数据
    const submitData = {
      cardno: this.data.department,
      xinmin: this.data.doctorName,
      memo: this.data.thankLetter,
      openid: wx.getStorageSync('openid'),
      wendupic: this.data.imageUrl || ''
    };

    // 调用提交接口
    req({
      url: util.baseUrl+'/newapi/api/youx/postyou',
      method: 'POST',
      data: submitData,
      success: (res) => {
        wx.hideLoading();
        if (res.data.status) {
          wx.showToast({
            title: '感谢您的提交',
            icon: 'success'
          });
          // 清空表单
          this.setData({
            department: '',
            doctorName: '',
            thankLetter: '',
            imageUrl: ''
          });
        } else {
          wx.showToast({
            title: res.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交失败:', err);
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        });
      }
    });
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