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
    // 原有数据
    activity: {
      title: '',
      location: '',
      time: ''
    },

    // 签到相关数据
    selectedName: '',
    selectedItem: null, // 选中的完整对象
    phoneNumber: '', // 手机号
    company: '', // 单位
    canSubmit: false,
    isSubmitting: false,

    // 会场签到接口参数
    typeid: 0,
    classid: 0,
    classname: '',

    // 姓名选择弹窗相关
    showNameModal: false,
    searchKeyword: '',
    tempSelectedName: '', // 临时选择的姓名
    tempSelectedItem: null, // 临时选择的完整对象
    keyboardHeight: 0, // 键盘高度

    // 姓名列表
    nameList: [],

    // 过滤后的姓名列表
    filteredNameList: [],

    // 配置信息
    configInfo: null,

    // 定位相关
    targetLocation: null, // 目标位置
    currentLocation: null, // 当前位置
    currentAddress: '', // 当前地址
    distance: null, // 距离
    canCheckIn: false, // 是否在范围内
    allowedRange: 500, // 允许签到范围（米），默认500米

    // 手写签名相关
    showSignatureModal: false, // 是否显示签名弹窗
    signatureImage: '', // 签名图片base64
    hasDrawn: false, // 是否已经开始签名
    canvasWidth: 0, // canvas宽度
    canvasHeight: 0, // canvas高度
  },

  // Canvas 上下文
  ctx: null,
  // 上一个触摸点
  lastPoint: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化过滤后的姓名列表
    this.setData({
      filteredNameList: this.data.nameList,
      // 接收页面参数
      typeid: options.typeid ? parseInt(options.typeid) : 0,
      classid: options.classid ? parseInt(options.classid) : 0,
      classname: options.classname || ''
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 初始化签名画布
    this.initSignatureCanvas();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getStudentList()
    this.getConfig1()
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
        if (res.data && res.data.data) {
          // 更新姓名列表
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
  getConfig1() {
    req({
      url: util.baseUrl + "/newapi/api/qkh/getconfig1",
      method: "POST",
      success: res => {
        console.log('getconfig1接口返回数据:', res.data);
        if (res.data.status) {
          // 根据接口返回的数据结构处理配置信息
          const configData = res.data.data;
          this.setData({
            configInfo: configData
          });
          
          // 从 posx 和 posy 字段获取目标位置
          // 注意：posx 是经度(longitude)，posy 是纬度(latitude)
          console.log('位置信息 - posx:', configData.posx, 'posy:', configData.posy);
          
          if (configData.posx && configData.posy) {
            const longitude = Number(configData.posx);  // posx = 经度
            const latitude = Number(configData.posy);   // posy = 纬度
            console.log('解析的经纬度 - 纬度:', latitude, '经度:', longitude);
            
            if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
              this.setData({
                targetLocation: {
                  latitude,
                  longitude
                }
              });
              console.log('✅ 目标位置设置成功 - 纬度:', latitude, '经度:', longitude);
            } else {
              console.error('❌ 位置信息格式错误，不是有效数字:', { posx: configData.posx, posy: configData.posy });
              wx.showToast({
                title: '目标位置配置错误',
                icon: 'none'
              });
            }
          }
          
          // 如果配置中包含范围信息（memo字段）
          const rangeValue = configData.range || configData.memo;
          console.log('范围信息字段:', rangeValue);
          
          if (rangeValue) {
            const range = Number(rangeValue);
            if (Number.isFinite(range) && range > 0) {
              this.setData({
                allowedRange: range
              });
              console.log('✅ 允许范围设置为:', range, '米');
            } else {
              console.warn('⚠️ 范围值不是有效数字，使用默认值500米');
            }
          } else {
            console.warn('⚠️ 配置中未包含范围信息，使用默认值500米');
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
      title: this.data.activityTitle,
      path: '/subpackagesC/dingwei/dingwei'
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
      filteredNameList: this.data.nameList
    });

    // 监听键盘弹出事件
    wx.onKeyboardHeightChange(this.onKeyboardHeightChange.bind(this));
  },

  // 隐藏姓名选择弹窗
  hideNameModal() {
    this.setData({
      showNameModal: false,
      searchKeyword: '',
      tempSelectedName: '',
      tempSelectedItem: null
    });

    // 移除键盘监听
    wx.offKeyboardHeightChange(this.onKeyboardHeightChange);
  },

  // 键盘高度变化处理
  onKeyboardHeightChange(res) {
    const keyboardHeight = res.height;
    if (keyboardHeight > 0) {
      // 键盘弹出，调整弹窗位置
      this.setData({
        keyboardHeight: keyboardHeight
      });
    } else {
      // 键盘收起
      this.setData({
        keyboardHeight: 0
      });
    }
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

  // 选择姓名
  selectName(e) {
    const name = e.currentTarget.dataset.name;
    const item = e.currentTarget.dataset.item;
    console.log('选择的姓名:', name, '完整对象:', item);
    this.setData({
      tempSelectedName: name,
      tempSelectedItem: item // 保存完整的对象信息
    });
  },

  // 确认姓名选择
  confirmNameSelection() {
    if (this.data.tempSelectedName && this.data.tempSelectedItem) {
      this.setData({
        selectedName: this.data.tempSelectedName,
        selectedItem: this.data.tempSelectedItem, // 保存完整的选中对象
        showNameModal: false,
        searchKeyword: '',
        tempSelectedName: '',
        tempSelectedItem: null
      });
      this.checkCanSubmit();
    } else {
      wx.showToast({
        title: '请选择姓名',
        icon: 'none'
      });
    }
  },

  // 手机号输入处理
  onPhoneInput(e) {
    const phoneNumber = e.detail.value;
    this.setData({
      phoneNumber: phoneNumber
    });
    
    // 如果手机号输入完整（11位），自动获取人员信息
    if (phoneNumber.length === 11 && /^1[3-9]\d{9}$/.test(phoneNumber)) {
      this.getPersonInfo(phoneNumber);
    } else {
      // 手机号不完整时，清空自动填写的信息
      this.setData({
        selectedName: '',
        company: '',
        classid: 0,
        classname: '',
        selectedItem: null
      });
    }
    
    this.checkCanSubmit();
  },

  // 单位输入处理
  onCompanyInput(e) {
    const company = e.detail.value;
    this.setData({
      company: company
    });
    this.checkCanSubmit();
  },

  // 姓名输入处理
  onNameInput(e) {
    const name = e.detail.value;
    this.setData({
      selectedName: name,
      selectedItem: null // 清空选中的完整对象，因为是手动输入
    });
    this.checkCanSubmit();
  },

  // 根据手机号获取人员信息
  getPersonInfo(mobile) {
    const that = this;
    
    // 显示加载提示
    wx.showLoading({
      title: '获取人员信息...',
      mask: true
    });

    req({
      url: util.baseUrl+'/newapi/api/qkh/getreninfo',
      method: 'POST',
      data: {
        mobile: mobile
      },
      success: (res) => {
        wx.hideLoading();
        
        // 调试信息：显示接口返回的完整数据
        console.log('getPersonInfo接口返回数据:', res.data);
        
        if (res.data.status) {
          const personInfo = res.data.data;
          console.log('人员信息:', personInfo);
          
          if (personInfo && personInfo.xinmin) {
            // 有人员信息，自动填写姓名和单位
            that.setData({
              selectedName: personInfo.xinmin,
              company: personInfo.corp || '',
              classid: personInfo.classid || 0,
              classname: personInfo.classname || '',
              selectedItem: {
                name: personInfo.xinmin,
                company: personInfo.corp || '',
                classid: personInfo.classid || 0,
                classname: personInfo.classname || ''
              }
            });
            
            wx.showToast({
              title: '已自动填写信息',
              icon: 'success',
              duration: 2000
            });
          } else {
            // 没有人员信息，继续手动填写
            console.log('未找到该手机号对应的人员信息');
          }
        } else {
          console.log('获取人员信息失败:', res.data);
        }
        
        that.checkCanSubmit();
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取人员信息接口调用失败:', err);
        // 接口调用失败时不显示错误提示，继续手动填写
      }
    });
  },

  /**
   * 获取当前位置
   */
  getLocation() {
    console.log('开始获取定位，检查授权状态');
    
    // 检查目标位置是否已设置
    if (!this.data.targetLocation) {
      console.error('目标位置未设置，无法进行距离计算');
      wx.showModal({
        title: '配置错误',
        content: '目标位置信息未正确加载，无法进行定位签到。请联系管理员检查配置。',
        showCancel: false
      });
      return;
    }
    
    wx.getSetting({
      success: (settingRes) => {
        const hasAuth = !!settingRes.authSetting && !!settingRes.authSetting['scope.userLocation'];
        if (hasAuth) {
          console.log('已授权定位，开始获取');
          this.doGetLocation();
        } else {
          console.log('未授权定位，尝试申请授权');
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              console.log('用户授权成功');
              this.doGetLocation();
            },
            fail: () => {
              console.warn('用户拒绝授权，提示前往设置');
              wx.showModal({
                title: '需要定位权限',
                content: '请在设置中开启定位权限以便进行签到定位。',
                confirmText: '去设置',
                cancelText: '取消',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (openRes) => {
                        const ok = !!openRes.authSetting && !!openRes.authSetting['scope.userLocation'];
                        if (ok) {
                          this.doGetLocation();
                        } else {
                          wx.showToast({ title: '未开启定位权限', icon: 'none' });
                        }
                      }
                    });
                  }
                }
              });
            }
          });
        }
      },
      fail: (err) => {
        console.error('获取授权状态失败:', err);
        wx.showToast({ title: '无法获取授权状态', icon: 'none' });
      }
    });
  },

  /**
   * 实际获取定位
   */
  doGetLocation() {
    console.log('调用 wx.getLocation');
    
    // 显示加载提示
    wx.showLoading({
      title: '获取定位中...',
      mask: true
    });
    
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      highAccuracyExpireTime: 3000,
      success: (res) => {
        console.log('wx.getLocation 成功:', res);
        const latitude = res.latitude;
        const longitude = res.longitude;
        this.setData({
          currentLocation: { latitude, longitude }
        }, () => {
          // 在 setData 回调中进行距离计算和地址获取
          this.calculateDistance();
          this.getCurrentAddress(latitude, longitude);
          
          // 隐藏加载提示
          wx.hideLoading();
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('wx.getLocation 失败:', err);
        wx.showToast({ 
          title: '获取位置失败，请检查定位与网络', 
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 计算距离
   */
  calculateDistance() {
    const { currentLocation, targetLocation } = this.data;
    if (!currentLocation || !targetLocation) {
      console.warn('距离计算条件不足：', { currentLocation, targetLocation });
      this.setData({ 
        canCheckIn: false,
        distance: null
      });
      return;
    }
    const distance = util.getDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );
    const range = Number(this.data.allowedRange);
    const canCheckIn = Number.isFinite(range) && Number.isFinite(distance) ? distance <= range : false;
    
    console.log('距离计算结果:', {
      distance: distance,
      allowedRange: range,
      canCheckIn: canCheckIn
    });
    
    this.setData({
      distance: Number.isFinite(distance) ? distance.toFixed(0) : null,
      canCheckIn
    }, () => {
      // 距离计算完成后，检查是否可以提交
      this.checkCanSubmit();
    });
  },

  /**
   * 获取当前位置地址 - 使用高德地图API
   */
  getCurrentAddress(latitude, longitude) {
    // 使用高德地图WebService API进行逆地址解析
    const key = '2576d6eb8c8d911d2d232ce376f58d81';
    // 注意：高德地图的location参数格式是"经度,纬度"
    const url = `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${key}&radius=1000&extensions=base`;
    
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        console.log('高德地图API返回:', res.data);
        if (res.data && res.data.status === '1' && res.data.regeocode) {
          const regeocode = res.data.regeocode;
          // 使用formatted_address作为地址
          let address = regeocode.formatted_address || '未知位置';
          
          this.setData({ 
            currentAddress: address 
          });
          console.log('地址解析成功:', address);
        } else {
          console.error('地址解析失败:', res.data);
          // 解析失败时显示经纬度
          this.setData({ 
            currentAddress: `经度：${longitude.toFixed(6)}，纬度：${latitude.toFixed(6)}` 
          });
        }
      },
      fail: (err) => {
        console.error('地址解析请求失败:', err);
        // 请求失败时显示经纬度
        this.setData({ 
          currentAddress: `经度：${longitude.toFixed(6)}，纬度：${latitude.toFixed(6)}` 
        });
      }
    });
  },

  /**
   * 检查是否可以提交
   */
  checkCanSubmit() {
    const {
      selectedName,
      company,
      signatureImage,
      canCheckIn
    } = this.data

    const canSubmit = selectedName &&
      company &&
      signatureImage &&
      canCheckIn; // 添加定位验证

    this.setData({
      canSubmit: canSubmit
    })
  },

  /**
   * 提交签到
   */
  submitCheckin() {
    const {
      selectedName,
      company,
      signatureImage
    } = this.data;

    // 详细验证
    if (!selectedName) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    if (!company) {
      wx.showToast({
        title: '请输入单位名称',
        icon: 'none'
      });
      return;
    }

    if (!signatureImage) {
      wx.showToast({
        title: '请先完成签名',
        icon: 'none'
      });
      return;
    }

    if (!this.data.canCheckIn) {
      wx.showToast({
        title: '请先完成定位打卡',
        icon: 'none'
      });
      return;
    }

    if (this.data.isSubmitting) {
      return
    }

    this.setData({
      isSubmitting: true
    })

    wx.showLoading({
      title: '提交中...'
    })

    // 将签名图片转换为base64
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath: signatureImage,
      encoding: 'base64',
      success: (fileRes) => {
        // 获取base64数据
        const base64Data = 'data:image/png;base64,' + fileRes.data;
        console.log('签名base64转换成功');
        
        // 调用会场签到接口
        req({
          url: util.baseUrl + "/newapi/api/qkh/qkhsign",
          method: "POST",
          data: {
            xinmin: this.data.selectedName,
            mobile: company, // 不需要手机号，传空字符串
            corp: base64Data, // corp字段（base64签名）
            typeid: this.data.typeid,
            classid: this.data.classid,
            classname: this.data.classname,
            openid: wx.getStorageSync('openid'),
            //signature: base64Data // base64格式的签名
          },
          success: res => {
            wx.hideLoading()
            this.setData({
              isSubmitting: false
            })

            if (res.data.status) {
              // 清空所有填写的内容
              this.setData({
                selectedName: '',
                selectedItem: null,
                company: '',
                signatureImage: '',
                hasDrawn: false,
                canSubmit: false
              });
              
              // 清空canvas
              if (this.ctx) {
                this.ctx.setFillStyle('#ffffff');
                this.ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
                this.ctx.draw();
              }
              
              wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel:false
              })
            } else {
              wx.showToast({
                title: res.data.msg || '签到失败，请重试',
                icon: 'none'
              })
            }
          },
          fail: err => {
            wx.hideLoading()
            this.setData({
              isSubmitting: false
            })
            console.error('提交签到失败:', err)
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('读取签名文件失败:', err);
        wx.hideLoading();
        this.setData({
          isSubmitting: false
        });
        wx.showToast({
          title: '签名处理失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 显示报到信息弹窗
   */
  showSignInfoModal() {
    // 显示报到成功提示
    wx.showModal({
      title: '报到成功',
      content: '您已成功完成会场报到',
      showCancel: false,
      confirmText: '确定',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定');
        }
      }
    });
  },

  /**
   * 初始化签名画布
   */
  initSignatureCanvas() {
    const that = this;
    const query = wx.createSelectorQuery();
    
    // 获取系统信息
    wx.getSystemInfo({
      success: function(res) {
        // 计算画布尺寸 (使用屏幕宽度-80rpx边距，高度为200rpx)
        const canvasWidth = res.windowWidth * 0.85; // 85%屏幕宽度
        const canvasHeight = 200 * res.windowWidth / 375; // 根据设计稿换算
        
        that.setData({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight
        });
        
        // 创建canvas上下文
        that.ctx = wx.createCanvasContext('signatureCanvas');
        that.ctx.setStrokeStyle('#000000');
        that.ctx.setLineWidth(3);
        that.ctx.setLineCap('round');
        that.ctx.setLineJoin('round');
      }
    });
  },

  /**
   * 显示签名弹窗
   */
  showSignatureModal() {
    this.setData({
      showSignatureModal: true,
      hasDrawn: false
    });
    
    // 延迟初始化，确保canvas已渲染
    setTimeout(() => {
      this.initSignatureCanvas();
      this.clearSignature();
    }, 100);
  },

  /**
   * 隐藏签名弹窗
   */
  hideSignatureModal() {
    this.setData({
      showSignatureModal: false
    });
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (!this.ctx) {
      this.initSignatureCanvas();
      return;
    }
    
    const touch = e.touches[0];
    this.lastPoint = {
      x: touch.x,
      y: touch.y
    };
    
    // 标记已经开始绘制
    if (!this.data.hasDrawn) {
      this.setData({
        hasDrawn: true
      });
    }
  },

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (!this.ctx || !this.lastPoint) return;
    
    const touch = e.touches[0];
    const currentPoint = {
      x: touch.x,
      y: touch.y
    };
    
    // 从上一个点画到当前点
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.ctx.lineTo(currentPoint.x, currentPoint.y);
    this.ctx.stroke();
    this.ctx.draw(true);
    
    // 更新上一个点
    this.lastPoint = currentPoint;
  },

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    this.lastPoint = null;
  },

  /**
   * 清除签名
   */
  clearSignature() {
    if (!this.ctx) return;
    
    // 清除画布
    this.ctx.setFillStyle('#ffffff');
    this.ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
    this.ctx.draw();
    
    this.setData({
      hasDrawn: false
    });
    
    this.lastPoint = null;
  },

  /**
   * 保存签名
   */
  saveSignature() {
    const that = this;
    
    if (!this.data.hasDrawn) {
      wx.showToast({
        title: '请先签名',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });
    
    // 将canvas内容导出为图片
    wx.canvasToTempFilePath({
      canvasId: 'signatureCanvas',
      success: function(res) {
        console.log('签名图片路径:', res.tempFilePath);
        
        // 保存签名图片路径
        that.setData({
          signatureImage: res.tempFilePath,
          showSignatureModal: false
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '签名保存成功',
          icon: 'success'
        });
        
        // 重新检查提交状态
        that.checkCanSubmit();
      },
      fail: function(err) {
        console.error('保存签名失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    });
  },


})