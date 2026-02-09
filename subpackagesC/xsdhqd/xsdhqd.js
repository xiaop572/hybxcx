// subpackagesC/dingwei/dingwei.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 签到相关数据
    selectedName: '',
    selectedItem: null, // 选中的完整对象
    canSubmit: false,
    isSubmitting: false,

    // 会场签到接口参数
    typeid: 1, // 设置为1
    classid: 0,
    classname: '',

    // 姓名选择弹窗相关
    showNameModal: false,
    searchKeyword: '',
    tempSelectedName: '', // 临时选择的姓名
    tempSelectedItem: null, // 临时选择的完整对象

    // 姓名列表
    nameList: [],

    // 过滤后的姓名列表
    filteredNameList: [],

    // 配置信息
    configInfo: null,

    // 报到信息相关
    showSignInfo: false,
    signInfo: null, // 改为单个对象
    isLoadingSignInfo: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化过滤后的姓名列表
    this.setData({
      filteredNameList: this.data.nameList,
      // 接收页面参数，如果没有传入typeid则默认为1
      typeid: options.typeid ? parseInt(options.typeid) : 1,
      classid: options.classid ? parseInt(options.classid) : 0,
      classname: options.classname || ''
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getStudentList()
    this.getConfig3()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载
  },



  /**
   * 获取学生姓名列表
   */
  getStudentList() {
    // 获取用户openid
    const openid = wx.getStorageSync('openid') || '';

    if (!openid) {
      console.error('未获取到用户openid');
      return;
    }

    req({
      url: util.baseUrl + "/newapi/api/qkh/studentlist",
      method: "POST",
      data: {
        openid: openid
      },
      success: res => {
        if (res.data.status) {
          // 更新姓名列表（直接使用接口字段 xinmin）
          this.setData({
            nameList: res.data.data,
            filteredNameList: res.data.data
          });
        }
      },
      fail: err => {
        console.error('获取学生列表失败:', err);
      }
    })
  },

  /**
   * 获取配置信息
   */
  getConfig3() {
    req({
      url: util.baseUrl + "/newapi/api/qkh/getconfig3",
      method: "POST",
      success: res => {
        console.log('getconfig1接口返回数据:', res.data);
        if (res.data.status) {
          // 根据接口返回的数据结构处理配置信息
          const configData = res.data.data;
          this.setData({
            configInfo: configData
          });
          
          // 如果配置中包含位置信息，可以更新目标位置
          if (configData && configData.location) {
            this.setData({
              targetLocation: configData.location
            });
          }
          
          // 如果配置中包含范围信息，可以更新允许范围
          if (configData && configData.range) {
            this.setData({
              allowedRange: configData.range
            });
          }
        }
      },
      fail: err => {
        console.error('获取配置信息失败:', err);
        wx.showToast({
          title: '获取配置失败',
          icon: 'none'
        });
      }
    })
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
      title: this.data.activityTitle,
      path: '/subpackagesC/xsdhqd/xsdhqd'
    }
  },

  /**
   * 转发按钮点击事件
   */
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  /**
   * 显示姓名选择器
   */
  showNamePicker() {
    this.setData({
      showNameModal: true,
      searchKeyword: '',
      tempSelectedName: this.data.selectedName,
      tempSelectedItem: this.data.selectedItem,
      filteredNameList: this.data.nameList
    });
  },

  // 隐藏姓名选择弹窗
  hideNameModal() {
    this.setData({
      showNameModal: false,
      searchKeyword: '',
      tempSelectedName: '',
      tempSelectedItem: null
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击弹窗内容时关闭弹窗
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    const filteredList = this.data.nameList.filter(item =>
      item.xinmin && item.xinmin.toLowerCase().includes(keyword.toLowerCase())
    );
    this.setData({
      searchKeyword: keyword,
      filteredNameList: filteredList
    });
  },

  // 选择姓名（仅设置临时选中，不立即关闭弹窗）
  selectName(e) {
    const name = e.currentTarget.dataset.xinmin;
    const item = e.currentTarget.dataset.item;
    this.setData({
      tempSelectedName: name,
      tempSelectedItem: item
    });
  },

  confirmNameSelection() {
    const { tempSelectedName, tempSelectedItem, nameList, selectedItem } = this.data;
    if (!tempSelectedName) {
      wx.showToast({
        title: '请选择姓名',
        icon: 'none'
      });
      return;
    }
    // 若未明确选择对象，则根据姓名匹配列表中的对象，或回退到已选对象
    const matchedItem = tempSelectedItem || nameList.find(it => it.xinmin === tempSelectedName) || selectedItem || null;
    this.setData({
      selectedName: tempSelectedName,
      selectedItem: matchedItem,
      showNameModal: false,
      searchKeyword: '',
      tempSelectedName: '',
      tempSelectedItem: null
    });
    this.checkCanSubmit();
  },


  /**
   * 检查是否可以提交
   */
  checkCanSubmit() {
    const { selectedName } = this.data;
    const canSubmit = selectedName && selectedName.trim() !== '';

    this.setData({
      canSubmit: canSubmit
    });
  },

  /**
   * 提交签到
   */
  submitCheckin() {
    const { selectedName, selectedItem, remark, base64Image } = this.data;

    // 详细验证
    if (!selectedName) {
      wx.showToast({
        title: '请选择姓名',
        icon: 'none'
      });
      return;
    }

    if (this.data.isSubmitting) {
      return;
    }

    this.setData({
      isSubmitting: true
    });

    wx.showLoading({
      title: '提交中...'
    });

    // 读取 openid 与当前时间
    const openid = wx.getStorageSync('openid') || '';
    const now = new Date();
    const checkin_time = now;

    // 直接发起请求，其他参数置空字符串
    req({
      url: util.baseUrl + "/newapi/api/bl/savecheckinrecord",
      method: "POST",
      data: {
        openid: openid,
        realname: selectedName,
        base64Image: '',
        xpos: 0,
        ypos: 0,
        checkin_time: checkin_time,
        remark: ''
      },
      success: res => {
        wx.hideLoading();
        this.setData({
          isSubmitting: false
        });

        if (res.data && (res.data.status === true || res.data.success === true)) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          });

          // 清空表单数据
          this.setData({
            selectedName: '',
            selectedItem: null,
            remark: '',
            base64Image: '',
            canSubmit: false
          });
        } else {
          wx.showToast({
            title: (res.data && (res.data.msg || res.data.message)) || '提交失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        this.setData({
          isSubmitting: false
        });
        console.error('提交失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 显示报到信息浮窗
   */
  showSignInfoModal() {
    this.setData({
      showSignInfo: true
    });
    // 获取报到信息
    this.getSignInfoList();
  },

  // 隐藏报到信息弹窗
  hideSignInfoModal() {
    this.setData({
      showSignInfo: false,
      signInfo: null,
      isLoadingSignInfo: false
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡，防止点击弹窗内容时关闭弹窗
  },

  // 获取报到信息
  getSignInfoList() {
    this.setData({
      isLoadingSignInfo: true
    });

    const openid = wx.getStorageSync('openid') || '';
    
    if (!openid) {
      this.setData({
        isLoadingSignInfo: false,
        signInfo: null
      });
      wx.showToast({
        title: '未获取到用户信息',
        icon: 'none'
      });
      return;
    }

    req({
      url: util.baseUrl + "/newapi/api/qkh/getqkhcheckin",
      method: "POST",
      data: {
        openid: openid
      },
      success: res => {
        this.setData({
          isLoadingSignInfo: false
        });

        if (res.data && res.data.status) {
          const dataObj = res.data.data;
          
          if (dataObj && typeof dataObj === 'object') {
            // 直接处理对象，归一化字段名
            const signInfo = {
              realname: dataObj.realname || '',
              mobile: dataObj.mobile || '',
              corp: dataObj.corp || '',
              addtime: this.formatDateTime(dataObj.checkin_time || dataObj.create_time || dataObj.addtime || ''),
              imageUrl: dataObj.imageUrl || '',
              remark: dataObj.remark || '',
              xpos: dataObj.xpos ?? '',
              ypos: dataObj.ypos ?? ''
            };
            
            this.setData({
              signInfo: signInfo
            });
          } else {
            this.setData({
              signInfo: null
            });
            wx.showToast({
              title: '暂无报到信息',
              icon: 'none'
            });
          }
        } else {
          this.setData({
            signInfo: null
          });
          wx.showToast({
            title: res.data.msg || '获取报到信息失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        this.setData({
          isLoadingSignInfo: false,
          signInfo: null
        });
        console.error('获取报到信息失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 查看报到信息详情
   */
  viewSignDetail() {
    if (this.data.signInfo) {
      // 隐藏浮窗
      this.setData({
        showSignInfo: false
      });
      
      // 跳转到详情页面
      const signInfo = {
        xinmin: this.data.signInfo.realname,
        mobile: this.data.signInfo.mobile,
        corp: this.data.signInfo.corp,
        time: this.data.signInfo.addtime
      };
      
      wx.navigateTo({
        url: `./success?signInfo=${encodeURIComponent(JSON.stringify(signInfo))}`
      });
    }
  },

  /**
   * 获取报到信息并直接跳转到详情页面
   */
  getSignInfoAndNavigate() {
    const openid = wx.getStorageSync('openid') || '';
    
    if (!openid) {
      wx.showToast({
        title: '未获取到用户信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    req({
      url: util.baseUrl + "/newapi/api/qkh/getqkhsign",
      method: "POST",
      data: {
        openid: openid
      },
      success: res => {
        wx.hideLoading();

        if (res.data && res.data.status) {
          // 处理数据，支持对象和数组两种格式
          const dataList = res.data.data;
          let signInfo = {};
          const normalizeItem = (item) => ({
            xinmin: item.realname || item.xinmin || '',
            mobile: item.mobile || '',
            corp: item.corp || '',
            time: this.formatDateTime(item.checkin_time || item.addtime || item.create_time || '')
          });
          
          if (Array.isArray(dataList) && dataList.length > 0) {
            signInfo = normalizeItem(dataList[0]);
          } else if (dataList && typeof dataList === 'object') {
            signInfo = normalizeItem(dataList);
          } else {
            wx.showToast({
              title: '暂无报到信息',
              icon: 'none'
            });
            return;
          }
          
          // 跳转到 success 页面
          wx.navigateTo({
            url: `./success?signInfo=${encodeURIComponent(JSON.stringify(signInfo))}`
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取报到信息失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('获取报到信息失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 格式化时间
  formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '未知';
    
    try {
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('时间格式化失败:', error);
      return dateTimeStr;
    }
  },




})