const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
let app=getApp()
// subpackagesC/zxwz/zxwz.js
Page({
  data: {
    selectedOptions: {},
    questionnaire: null,
    loading: true
  },

  onLoad: function (options) {
    // 页面加载时执行
    this.getquestionnaire()
  },
  getquestionnaire() {
    req({
      url: util.baseUrl + "/newapi/api/tj2tj/getquestionnaire",
      data: {
        id: 1
      },
      success: res => {
        if (res.data && res.data.status) {
          this.setData({
            questionnaire: res.data.data,
            loading: false
          })
        } else {
          wx.showToast({
            title: '获取问卷失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },
  // 切换选项
  toggleOption: function (e) {
    const question = e.currentTarget.dataset.question;
    const option = e.currentTarget.dataset.option;
    const type = e.currentTarget.dataset.type; // 获取问题类型：单选或多选
    const key = `${question}-${option}`;

    // 获取当前选项状态
    const currentValue = this.data.selectedOptions[key] || false;

    // 创建新的选项状态对象
    const newSelectedOptions = {
      ...this.data.selectedOptions
    };

    // 如果是第一题的"无"选项
    if (question === '1' && option === '4') {
      if (!currentValue) {
        // 清除该问题的其他选项
        Object.keys(newSelectedOptions).forEach(k => {
          if (k.startsWith('1-') && k !== '1-4') {
            delete newSelectedOptions[k];
          }
        });
        // 设置"无"选项为选中
        newSelectedOptions[key] = true;
      } else {
        // 取消选中
        delete newSelectedOptions[key];
      }
    } else if (question === '1') {
      // 如果选择了第一题的其他选项，取消"无"选项
      if (!currentValue) {
        delete newSelectedOptions['1-4'];
        // 切换当前选项
        newSelectedOptions[key] = true;
      } else {
        // 取消选中
        delete newSelectedOptions[key];
      }
    }

    // 如果是第二题的"无上述问题"选项
    if (question === '2' && option === '6') {
      if (!currentValue) {
        // 清除该问题的其他选项
        Object.keys(newSelectedOptions).forEach(k => {
          if (k.startsWith('2-') && k !== '2-6') {
            delete newSelectedOptions[k];
          }
        });
        // 设置"无上述问题"选项为选中
        newSelectedOptions[key] = true;
      } else {
        // 取消选中
        delete newSelectedOptions[key];
      }
    } else if (question === '2') {
      // 如果选择了第二题的其他选项，取消"无上述问题"选项
      if (!currentValue) {
        delete newSelectedOptions['2-6'];
        // 切换当前选项
        newSelectedOptions[key] = true;
      } else {
        // 取消选中
        delete newSelectedOptions[key];
      }
    } else {
      // 处理其他问题的选项
      if (type === 'radio') { // 单选题
        if (!currentValue) {
          // 清除该问题的其他选项
          Object.keys(newSelectedOptions).forEach(k => {
            if (k.startsWith(`${question}-`) && k !== key) {
              delete newSelectedOptions[k];
            }
          });
          // 设置当前选项为选中
          newSelectedOptions[key] = true;
        } else {
          // 单选题不允许取消选择，保持选中状态
          newSelectedOptions[key] = true;
        }
      } else { // 多选题
        // 切换当前选项的选中状态
        newSelectedOptions[key] = !currentValue;
      }
    }

    // 打印日志，帮助调试
    console.log('选项状态更新:', newSelectedOptions);

    this.setData({
      selectedOptions: newSelectedOptions
    });
  },

  // 提交表单
  submitForm: function () {
    if (!this.data.questionnaire) {
      wx.showToast({
        title: '问卷数据加载失败',
        icon: 'none'
      });
      return;
    }

    // 获取所有问题
    const allQuestions = this.data.questionnaire.categories
      .flatMap(category => category.questions);

    // 检查是否每个问题都至少选择了一个选项
    const unansweredQuestions = allQuestions.filter(question => {
      return !Object.keys(this.data.selectedOptions).some(key =>
        key.startsWith(`${question.id}-`)
      );
    });

    if (unansweredQuestions.length > 0) {
      wx.showToast({
        title: '请完成所有问题',
        icon: 'none'
      });
      return;
    }

    // 提交表单数据
    wx.showLoading({
      title: '提交中...'
    });

    // 准备提交的数据
    const submitData = {
      user_id: wx.getStorageSync('openid'),
      questionnaire_id: 1,
      answers: Object.keys(this.data.selectedOptions).map(key => {
        const [questionId, optionId] = key.split('-');
        // 从问卷数据中找到对应的问题和选项
        const question = this.data.questionnaire.categories
          .flatMap(category => category.questions)
          .find(q => q.id === parseInt(questionId));
        const option = question ? question.options.find(opt => opt.id === parseInt(optionId)) : null;
        return {
          question_id: parseInt(questionId),
          option_id: parseInt(optionId),
          text_answer: option ? option.option_text : ""
        };
      })
    };
    req({
      url: util.baseUrl + "/newapi/api/tj2tj/submitquestionnaireanswer",
      method: 'POST',
      data: submitData,
      success: res => {
        wx.hideLoading();
        if ( res.data.status) {
          // 如果返回了推荐项目数据
          app.globalData.tjtjxm=res.data.data;
          // 将推荐项目数据存储到本地缓存

          // 跳转到体检项目推荐页面
          wx.navigateTo({
            url: '/subpackagesC/tjfa/tjfa',
            success: () => {
              console.log('跳转到体检项目推荐页面成功');
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              wx.showToast({
                title: '跳转失败',
                icon: 'none'
              });
            }
          });

        } else {
          wx.showToast({
            title: res.data.msg || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});