// huodongpage/xxysbm/xxysbm.js
const util = require('../../utils/util');
const { req } = require('../../utils/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      contactPerson: '',
      contactPhone: '',
      peopleCount: '',
      ageRange: '',
      organization: ''
    },
    selectedBooking: '',
    bookingDayIndex: 0,
    bookingDayText: '',
    bookingDays: [],  // 将在onLoad中动态生成
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  
  },

  /**
   * 生成后面3个月的周三、周四、周五日期
   */
  generateNextWeekDays() {
    try {
      console.log('开始生成预约日期');
      
      // 创建今天的日期对象
      const today = new Date();
      if (!(today instanceof Date) || isNaN(today.getTime())) {
        console.error('无效的日期对象');
        this.setData({ 
          bookingDays: [],
          bookingDayText: '',
          selectedBooking: '',
          bookingDayIndex: 0
        });
        return;
      }
      
      console.log('当前日期:', today.toISOString());
      
      // 计算3个月后的日期
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      
      console.log('3个月后的日期:', threeMonthsLater.toISOString());
      
      // 格式化日期
      const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          console.error('格式化日期时遇到无效日期');
          return '日期无效';
        }
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth()返回0-11
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
      };
      
      // 生成所有可预约的日期
      const bookingDays = [];
      const currentDate = new Date(today);
      
      // 从明天开始查找
      currentDate.setDate(today.getDate() + 1);
      
      while (currentDate <= threeMonthsLater) {
        const dayOfWeek = currentDate.getDay(); // 0是周日，1是周一，以此类推
        
        // 如果是周三(3)、周四(4)、周五(5)
        if (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) {
          const dayName = dayOfWeek === 3 ? '周三' : dayOfWeek === 4 ? '周四' : '周五';
          const dateValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          
          bookingDays.push({
            value: dateValue,
            label: `${formatDate(currentDate)} (${dayName})`
          });
        }
        
        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log('生成的预约日期:', bookingDays);
      
      // 检查生成的数据是否有效
      if (!Array.isArray(bookingDays) || bookingDays.length === 0 ||
          !bookingDays.every(day => day && day.value && day.label)) {
        console.error('生成的预约日期数据无效');
        this.setData({ 
          bookingDays: [],
          bookingDayText: '',
          selectedBooking: '',
          bookingDayIndex: 0
        });
        return;
      }
      
      // 更新数据，不设置默认选择
      this.setData({ 
        bookingDays,
        bookingDayIndex: -1,
        selectedBooking: '',
        bookingDayText: ''
      });
      
      console.log('预约日期生成完成，共生成', bookingDays.length, '个可选日期');
    } catch (error) {
      console.error('生成预约日期时出错:', error);
      this.setData({ 
        bookingDays: [],
        bookingDayText: '',
        selectedBooking: '',
        bookingDayIndex: 0
      });
    }
  },

  /**
   * 处理预约时间选择变化
   */
  onBookingDayChange(e) {
    console.log('选择预约时间:', e);
    
    // 检查事件对象是否有效
    if (!e) {
      console.error('事件对象为空');
      wx.showToast({
        title: '选择无效，请重试',
        icon: 'none'
      });
      return;
    }
    
    // 检查detail和value是否存在
    if (!e.detail) {
      console.error('事件detail为空');
      wx.showToast({
        title: '选择无效，请重试',
        icon: 'none'
      });
      return;
    }
    
    // 确保value是数字
    const indexValue = e.detail.value;
    if (typeof indexValue !== 'number' && typeof indexValue !== 'string') {
      console.error('选择索引无效:', indexValue);
      wx.showToast({
        title: '选择无效，请重试',
        icon: 'none'
      });
      return;
    }
    
    // 转换为数字
    const index = Number(indexValue);
    if (isNaN(index)) {
      console.error('索引不是有效数字');
      wx.showToast({
        title: '选择无效，请重试',
        icon: 'none'
      });
      return;
    }
    
    // 检查bookingDays是否存在且有数据
    if (!this.data.bookingDays) {
      console.error('bookingDays未定义');
      wx.showToast({
        title: '预约日期未加载，请刷新页面',
        icon: 'none'
      });
      return;
    }
    
    if (!Array.isArray(this.data.bookingDays) || this.data.bookingDays.length === 0) {
      console.error('bookingDays不是数组或为空数组');
      wx.showToast({
        title: '预约日期未加载，请刷新页面',
        icon: 'none'
      });
      return;
    }
    
    // 检查索引是否在有效范围内
    if (index < 0 || index >= this.data.bookingDays.length) {
      console.error('索引超出范围:', index, '数组长度:', this.data.bookingDays.length);
      wx.showToast({
        title: '选择无效，请重试',
        icon: 'none'
      });
      return;
    }
    
    // 获取选中的日期
    const selectedDay = this.data.bookingDays[index];
    if (!selectedDay || !selectedDay.value || !selectedDay.label) {
      console.error('选中的日期对象无效:', selectedDay);
      wx.showToast({
        title: '选择无效，请重试',
        icon: 'none'
      });
      return;
    }
    
    console.log('选中的日期:', selectedDay);
    
    // 更新数据
    this.setData({
      bookingDayIndex: index,
      selectedBooking: selectedDay.value,
      bookingDayText: selectedDay.label
    });
    
    // 添加视觉反馈
    wx.showToast({
      title: '已选择' + selectedDay.label,
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 输入处理函数
   */
  onContactPersonInput(e) {
    console.log('联系人输入:', e.detail.value);
    this.setData({
      'formData.contactPerson': e.detail.value
    });
  },

  onContactPhoneInput(e) {
    console.log('联系方式输入:', e.detail.value);
    this.setData({
      'formData.contactPhone': e.detail.value
    });
  },

  onPeopleCountInput: function(e) {
    const value = e.detail.value;
    console.log('参与人数输入:', value, '类型:', typeof value);
    // 直接使用字符串值，不转换为数字
    this.setData({
      'formData.peopleCount': value
    });
  },

  onAgeRangeInput(e) {
    console.log('年龄范围输入:', e.detail.value);
    this.setData({
      'formData.ageRange': e.detail.value
    });
  },

  onOrganizationInput(e) {
    console.log('所属组织输入:', e.detail.value);
    this.setData({
      'formData.organization': e.detail.value
    });
  },

  /**
   * 表单提交
   */
  submitForm() {
    console.log('开始提交表单');
    
    // 防止重复提交
    if (this.data.isSubmitting) {
      console.log('表单正在提交中，防止重复提交');
      return;
    }
    
    // 直接获取表单数据
    const formData = this.data.formData;
    console.log('当前表单数据:', JSON.stringify(formData));
    
    // 确保formData对象存在
    if (!formData) {
      console.error('formData对象不存在');
      wx.showToast({
        title: '表单数据错误，请刷新页面重试',
        icon: 'none'
      });
      return;
    }
    
    // 表单验证 - 联系人
    if (!formData.contactPerson || (typeof formData.contactPerson === 'string' && formData.contactPerson.trim() === '')) {
      console.log('联系人为空或无效:', formData.contactPerson, '类型:', typeof formData.contactPerson);
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      });
      return;
    }
    
    // 表单验证 - 联系方式
    if (!formData.contactPhone || (typeof formData.contactPhone === 'string' && formData.contactPhone.trim() === '')) {
      console.log('联系方式为空或无效:', formData.contactPhone, '类型:', typeof formData.contactPhone);
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      });
      return;
    }
    
    // 表单验证 - 预约日期
    if (!this.data.selectedBooking) {
      console.log('预约日期为空:', this.data.selectedBooking, '预约日期文本:', this.data.bookingDayText);
      wx.showToast({
        title: '请选择预约日期',
        icon: 'none'
      });
      return;
    }
    
    console.log('选择的预约日期:', this.data.selectedBooking, '预约日期文本:', this.data.bookingDayText, '索引:', this.data.bookingDayIndex);
    
    // 验证手机号格式
    if (!formData.contactPhone || !/^1\d{10}$/.test(formData.contactPhone)) {
      console.log('手机号格式不正确:', formData.contactPhone, '类型:', typeof formData.contactPhone);
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      });
      return;
    }
    
    // 表单验证 - 参与人数
    if (!formData.peopleCount) {
      console.log('参与人数为空或无效:', formData.peopleCount, '类型:', typeof formData.peopleCount);
      wx.showToast({
        title: '请输入参与人数',
        icon: 'none'
      });
      return;
    }
    if (formData.peopleCount<20) {
      wx.showToast({
        title: '参与人数最少20人',
        icon: 'none'
      });
      return;
    }
    // 表单验证 - 年龄范围
    if (!formData.ageRange) {
      console.log('年龄范围为空或无效:', formData.ageRange, '类型:', typeof formData.ageRange);
      wx.showToast({
        title: '请输入年龄范围',
        icon: 'none'
      });
      return;
    }

    // 表单验证 - 所属组织
    if (!formData.organization || (typeof formData.organization === 'string' && formData.organization.trim() === '')) {
      console.log('所属组织为空或无效:', formData.organization, '类型:', typeof formData.organization);
      wx.showToast({
        title: '请输入所属组织',
        icon: 'none'
      });
      return;
    }
    
    console.log('表单验证通过');
    
    // 预约时间验证已在前面完成，此处无需重复验证
    
    // 设置提交状态
    this.setData({
      isSubmitting: true
    });
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    // 确保预约时间文本存在
    if (!this.data.bookingDayText) {
      wx.hideLoading();
      wx.showToast({
        title: '预约时间无效，请重新选择',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isSubmitting: false
      });
      return;
    }
    
    // 获取用户openid
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.hideLoading();
      wx.showToast({
        title: '用户信息获取失败，请重新登录',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isSubmitting: false
      });
      return;
    }
    
    // 再次检查预约时间文本是否有效
    if (!this.data.bookingDayText || this.data.bookingDayText.includes('无效')) {
      wx.hideLoading();
      wx.showToast({
        title: '预约时间无效，请重新选择',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isSubmitting: false
      });
      return;
    }
    
    // 准备提交的数据
    const submitData = {
      openid: openid,
      mobile: formData.contactPhone,
      xinmin: formData.contactPerson,
      typeid: 0,
      typename: "小小医生双语研学",
      renshu: formData.peopleCount, // 使用原始字符串值
      jhr: formData.contactPerson,
      years: formData.ageRange,
      ptitle: formData.organization, // 社会组织使用ptitle字段
      prole: this.data.bookingDayText  // 预约时间使用prole字段
    };
    
    console.log('最终提交数据:', submitData, '类型检查:', {
      renshu_type: typeof submitData.renshu,
      mobile_type: typeof submitData.mobile,
      openid_type: typeof submitData.openid,
      bookingDayText: this.data.bookingDayText
    });
    
    console.log('提交数据:', submitData);
    
    // 调用提交接口
    req({
      url: util.baseUrl + '/newapi/api/xys/tjxys',
      method: 'POST',
      data: submitData,
      success: (res) => {
        if (res.data.status) {
          // 提交成功
          wx.hideLoading();
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟返回或跳转到成功页面
          setTimeout(() => {
            wx.navigateBack();
            // 或者跳转到成功页面
            // wx.redirectTo({
            //   url: '/pages/success/success'
            // });
          }, 2000);
        } else {
          // 提交失败
          wx.hideLoading();
          wx.showToast({
            title: res.data.msg || '提交失败，请重试',
            icon: 'none',
            duration: 2000
          });
          this.setData({
            isSubmitting: false
          });
        }
      },
      fail: (err) => {
        // 网络错误等
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        this.setData({
          isSubmitting: false
        });
        console.error('提交失败', err);
      }
    });
  },
  onShow(){
    this.setData({
      isSubmitting:false
    })
    wx.hideLoading()
    this.generateNextWeekDays();
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '和平小小医生双语研学活动报名',
      path: '/huodongpage/xxysbm/xxysbm',
      imageUrl: 'https://wx.pmc-wz.com/materials/xxysbm_share.jpg'
    };
  }
})