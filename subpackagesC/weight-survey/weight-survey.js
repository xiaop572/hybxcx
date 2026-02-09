const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");

Page({
  data: {
    formData: {},
    weight_start_time: "请选择日期"
  },

  onLoad() {
    // 页面加载时的初始化逻辑
  },

  bindWeightStartTimeChange(e) {
    this.setData({
      weight_start_time: e.detail.value
    });
  },

  submitSurvey(e) {
    const formData = e.detail.value;
    console.log('提交的表单数据：', formData);

    // 处理表单数据，使字段名与后端DTO一致
    const submitData = {
      gender: formData.sex,
      height: formData.height,
      weight: formData.weight,
      waistline: formData.waistline,
      phone: formData.phone,
      diet_regularity: formData.diet_pattern,
      favorite_food: formData.common_foods ? formData.common_foods.join(',') : '',
      daily_water: formData.water_intake,
      exercise_frequency: formData.exercise_frequency,
      exercise_duration: formData.exercise_duration,
      overweight_duration: formData.weight_duration,
      weight_gain_time: String(formData.weight_start_time),
      special_period_weight_gain: formData.weight_gain_periods ? formData.weight_gain_periods.join(',') : '',
      weight_loss_experience: formData.weight_loss_experience,
      weight_loss_method: formData.weight_loss_methods ? formData.weight_loss_methods.join(',') : '',
      weight_loss_count: formData.weight_loss_times,
      weight_loss_total: formData.weight_loss_months,
      weight_loss_effect: formData.weight_loss_effect,
      family_obesity_history: formData.family_obesity,
      combined_diseases: formData.risk_factors ? formData.risk_factors.join(',') : '',
      is_smoking: formData.smoking,
      smoking_info: formData.smoking === 'yes' ? `吸烟${formData.smoking_years}年，每日${formData.smoking_per_day}支` : '',
      is_drinking: formData.drinking,
      drinking_info: formData.drinking === 'yes' ? `饮酒${formData.drinking_years}年，每日${formData.drinking_per_day}两` : '',
      weight_loss_purpose: formData.weight_purpose,
      weight_loss_willingness: String(formData.weight_intention_score),
      expected_weight_loss: formData.ideal_weight,
      weight_loss_target: formData.weight_goal,
      glp1_contraindication1: formData.mtc_men2,
      glp1_contraindication2: formData.disease_history,
      glp1_contraindication3: formData.insulin_usage,
      glp1_contraindication4: formData.oral_medication,
      glp1_contraindication5: formData.pregnancy_lactation,
      openid: wx.getStorageSync('openid')
    };

    // 表单验证
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

    // 发送表单数据到服务器
    wx.showLoading({
      title: '提交中...'
    });
    console.log(formData)
    req({
      url: util.baseUrl+'/newapi/api/weight/savequestionnaire',
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
});