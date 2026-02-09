const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");

Page({
  data: {
    formData: {}
  },

  onLoad() {
    // 页面加载时的初始化逻辑
  },
  
  // 监听单选框变化
  radioChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  submitSurvey(e) {
    const formData = e.detail.value;
    console.log('提交的表单数据：', formData);

    // 处理表单数据，使字段名与后端DTO一致
    const submitData = {
      // 一、基本信息
      gender: formData.sex,
      age_range: formData.age,
      occupation: formData.occupation,
      height: formData.height,
      weight: formData.weight,
      phone: formData.phone,
      
      // 二、饮食习惯
      meal_regularity: formData.diet_pattern,
      breakfast_frequency: formData.breakfast_frequency,
      eating_out_frequency: formData.eating_out_frequency,
      diet_habits: formData.eating_habits ? formData.eating_habits.join(',') : '',
      
      // 三、食物摄入情况
      daily_vegetables_fruits: formData.vegetable_fruit_ratio,
      meat_frequency: formData.meat_frequency,
      seafood_frequency: formData.seafood_frequency,
      dairy_frequency: formData.dairy_frequency,
      processed_food_frequency: formData.processed_food_frequency,
      daily_water: formData.water_intake,
      
      // 四、健康与偏好
      sleep_quality: formData.sleep_quality,
      sleep_time: formData.sleep_time,
      wake_time: formData.wake_time,
      bowel_frequency: formData.bowel_frequency,
      constipation_solution: formData.constipation_solution,
      bowel_time_fixed: formData.bowel_time,
      exercise_situation: formData.exercise_frequency,
      weight_control_need: formData.weight_control,
      food_selection_factors: formData.food_choice_factors ? formData.food_choice_factors.join(',') : '',
      health_diet_adjustment: formData.diet_adjustment_health,
      
      // 五、改进意愿
      diet_improvement_need: formData.diet_improvement,
      diet_advice_wanted: formData.diet_advice ? formData.diet_advice.join(',') : '',
      diet_improvement_ways: formData.diet_improvement_channels ? formData.diet_improvement_channels.join(',') : '',
      
      // 健康问题（对接字段为reserve1）
      reserve1: formData.health_issue,
      
      // 用户信息
      openid: wx.getStorageSync('openid')
    };

    // 表单验证
    if (!formData.sex) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }

    if (!formData.age) {
      wx.showToast({
        title: '请选择年龄段',
        icon: 'none'
      });
      return;
    }

    if (!formData.height) {
      wx.showToast({
        title: '请输入身高',
        icon: 'none'
      });
      return;
    }

    if (!formData.weight) {
      wx.showToast({
        title: '请输入体重',
        icon: 'none'
      });
      return;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      });
      return;
    }

    if (!formData.diet_pattern) {
      wx.showToast({
        title: '请选择饮食规律性',
        icon: 'none'
      });
      return;
    }

    if (!formData.vegetable_fruit_ratio) {
      wx.showToast({
        title: '请选择蔬菜水果摄入量',
        icon: 'none'
      });
      return;
    }

    if (!formData.water_intake) {
      wx.showToast({
        title: '请选择每天饮水量',
        icon: 'none'
      });
      return;
    }

    if (!formData.exercise_frequency) {
      wx.showToast({
        title: '请选择运动情况',
        icon: 'none'
      });
      return;
    }

    // 如果用户选择需要调整饮食，则必须填写健康问题
    if (formData.diet_adjustment_health === '是' && !formData.health_issue) {
      wx.showToast({
        title: '请填写您的健康问题',
        icon: 'none'
      });
      return;
    }

    // 添加当前时间
    submitData.addtime = new Date();
    
    // 发送表单数据到服务器
    wx.showLoading({
      title: '提交中...'
    });
    console.log('提交数据：', submitData);
    console.log(formData)
    req({
      url: util.baseUrl+'/newapi/api/diet/savequestionnaire',
      method: 'POST',
      data: submitData,
      success: res => {
        if (res.data.status) {
          wx.hideLoading()
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg || '提交失败',
            icon: 'none'
          });
        }
      }
    })
  }
})