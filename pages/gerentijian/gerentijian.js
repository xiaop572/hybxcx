// pages/danweitijian/danweitijian.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['已婚', '未婚'],
    sexList: ['男', '女'],
    hunyin: "",
    timeList: [],
    time: "",
    sex: "",
    xinmin: "",
    mobile: "",
    cardno: "",
    fromsource: "",
    openid: "",
    ptype: 19,
    tjlist: [],
    product: "",
    ordid: 0,
    classid: 1,
    njvis: false,
    njtime: "",
    njtimeList: [],
    tcindex: 0,
    sfztypelist: ['居民身份证', '护照号'],
    sfztype: "",
    txlist: [],
    addtjvis: false,
    xinmint: "",
    mobilet: "",
    sext: "",
    sfztypet: "",
    cardnot: "",
    hunyint: "",
    tjyycs: "",
    // 问卷相关数据
    showQuestionnaire: false,
    questionnaire: {
      name: "",
      ethnicity: "",
      gender: "",
      birthDate: "",
      maritalStatus: "",
      familyDiseases: [],
      familyCancers: [],
      personalDiseases: [],
      surgeryHistory: "",
      transfusionHistory: "",
      infectiousDiseases: [],
      personalCancers: [],
      occupation: "",
      checkupFrequency: "",
      allergyHistory: ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../login/login',
            })
          }, 1000)
        }
      })
      return;
    }
    // this.getTime()
    this.gettjlist();
    
    // 显示检前问卷弹窗
    this.setData({
      showQuestionnaire: true
    });
  },
  addtx() {
    if (!this.data.xinmint) {
      wx.showToast({
        title: '请填写姓名!',
      })
      return;
    } else if (!this.data.mobilet) {
      wx.showToast({
        title: '请填写手机号!',
      })
      return;
    } else if (this.data.mobilet.length != 11) {
      wx.showToast({
        title: '手机号不正确',
      })
      return;
    } else if (!this.data.sext) {
      wx.showToast({
        title: '请选择性别!',
      })
      return;
    } else if (!this.data.sfztypet) {
      wx.showToast({
        title: '请选择证件类型',
      })
      return;
    } else if (!this.data.cardnot) {
      wx.showToast({
        title: '证件号不正确',
      })
      return;
    } else if (this.data.sfztypet == '居民身份证' && this.data.cardnot.length != 18) {
      wx.showToast({
        title: '身份证为18位',
      })
      return;
    } else if (!this.data.hunyint) {
      wx.showToast({
        title: '请选择婚姻!',
      })
      return;
    }
    let list = this.data.txlist;
    list.push({
      ptype: 19,
      openid: wx.getStorageSync('openid'),
      mobile: this.data.mobilet,
      xinmin: this.data.xinmint,
      sex: this.data.sext,
      cardno: this.data.cardnot,
      marry: this.data.hunyint,
      sfztype: this.data.sfztypet
    })
    this.setData({
      txlist: list,
      xinmint: "",
      mobilet: "",
      sext: "",
      sfztypet: "",
      cardnot: "",
      hunyint: "",
      addtjvis: false
    })
    console.log(this.data.txlist)
  },
  binddatachang(e) {
    this.setData({
      [e.currentTarget.dataset.changid]: this.data[e.currentTarget.dataset.list][e.detail.value]
    })
  },
  showtx() {
    this.setData({
      addtjvis: !this.data.addtjvis
    })
  },
  cancalbtn() {
    this.setData({
      addtjvis: false,
      xinmint: "",
      mobilet: "",
      sext: "",
      sfztypet: "",
      cardnot: "",
      hunyint: ""
    })
  },
  gettjlist() {
    req({
      url: util.baseUrl + "/newapi/api/tj/gettjlist",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        
        if(!res.data.data.length){
          wx.showModal({
            title: '提示',
            content: '请先购买套餐后预约',
            showCancel:false,
            complete: (res) => {
            }
          })
        }
        this.setData({
          tjlist: res.data.data
        })
      }
    })
  },
  getTime() {
    req({
      url: util.baseUrl + "/newapi/api/mindex/tjdate",
      method: "GET",
      data: {
        classid: this.data.classid
      },
      success: (res) => {
        this.setData({
          timeList: res.data.data,
          time: ""
        })
      }
    })
  },
  bindtjchange(e) {
    let that = this;
    this.setData({
      tcindex: parseInt(e.detail.value),
      tjyycs: this.data.tjlist[e.detail.value]['tjyycs'],
      txlist: []
    })
    if (this.data.tjlist[e.detail.value]['goodsname'].includes("新冠")) {
      this.setData({
        classid: 1
      }, () => {
        that.getTime()
      })
    } else {
      this.setData({
        classid: 2
      }, () => {
        that.getTime()
      })
    }
    this.setData({
      product: this.data.tjlist[e.detail.value]['goodsname'],
      ordid: this.data.tjlist[e.detail.value]['id']
    })
  },
  bindcsnychange(e){
    console.log(e)
    this.setData({
      cardno:e.detail.value
    })
  },
  bindNjTimeChange(e) {
    if (this.data.njtimeList.length > 0) {
      this.setData({
        njtime: this.data.njtimeList[e.detail.value]['sdate']
      })
    }
  },
  bindTimeChange(e) {
    this.setData({
      time: this.data.timeList[e.detail.value]['sdate']
    })
    let index = 0;
    console.log(this.data.tjlist)
    if (this.data.tjlist[this.data.tcindex]['weijin']) {
      for (let i = 0; i < this.data.timeList.length; i++) {
        if (this.data.timeList[e.detail.value]['sdate'] === this.data.timeList[i]['sdate']) {
          index = i;
        }
      }
      this.setData({
        njtimeList: this.data.timeList.slice(index + 1)
      })
      this.setData({
        njvis: true
      })
    } else {
      this.setData({
        njvis: false
      })
    }
  },
  bindsexchange(e) {
    this.setData({
      sex: this.data.sexList[e.detail.value]
    })
  },
  bindsfzchange(e) {
    this.setData({
      sfztype: this.data.sfztypelist[e.detail.value],
      cardno:""
    })
  },
  bindhunchange(e) {
    this.setData({
      hunyin: this.data.array[e.detail.value]
    })
  },
  rtijiao() {
    let reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名!',
      })
      return;
    } else if (!this.data.mobile) {
      wx.showToast({
        title: '请填写手机号!',
      })
      return;
    } else if (this.data.mobile.length != 11) {
      wx.showToast({
        title: '手机号不正确',
      })
      return;
    } else if (!this.data.sex) {
      wx.showToast({
        title: '请选择性别!',
      })
      return;
    } else if (!this.data.sfztype) {
      wx.showToast({
        title: '请选择证件类型',
      })
      return;
    } else if (!this.data.cardno) {
      wx.showToast({
        title: '证件号不正确',
      })
      return;
    } else if (this.data.sfztype == '居民身份证' && this.data.cardno.length != 18) {
      wx.showToast({
        title: '身份证为18位',
      })
      return;
    } else if (!this.data.hunyin) {
      wx.showToast({
        title: '请选择婚姻!',
      })
      return;
    } else if (!this.data.product) {
      wx.showToast({
        title: '请选择套餐!',
      })
      return;
    } else if (!this.data.time) {
      wx.showToast({
        title: '请选择时间!',
      })
      return;
    } else if (this.data.njvis && !this.data.njtime) {
      wx.showToast({
        title: '请选择内镜时间!',
      })
      return;
    }
    let params = {
      ptype: 19,
      openid: wx.getStorageSync('openid'),
      mobile: this.data.mobile,
      xinmin: this.data.xinmin,
      sex: this.data.sex,
      yydate: this.data.time,
      cardno: this.data.cardno,
      marry: this.data.hunyin,
      fromsource: wx.getStorageSync('sponsor'),
      product: this.data.product,
      ordid: this.data.ordid,
      weijindate: this.data.njtime,
      sfztype: this.data.sfztype
    }
    let list = this.data.txlist;
    for (let i = 0; i < list.length; i++) {
      list[i].yydate = this.data.time;
      list[i].fromsource = wx.getStorageSync('sponsor');
      list[i].product = this.data.product;
      list[i].ordid = this.data.ordid;
      list[i].weijindate = this.data.njtime;
      list[i].sfztype = this.data.sfztype;
    }
    if (list.length == 0) { //没有同行人员 预约后直接提示成功
      this.addpro(params, true)
    } else {
      this.addpro(params, false) //有同行人员 预约后不提示成功
      for (let i = 0; i < list.length; i++) {
        if (i == list.length - 1) {
          this.addpro(list[i], true) //同行人员 最后一个预约完成 提示成功
          this.setData({
            txlist: []
          })
        } else {
          this.addpro(list[i], false)
        }
      }
    }
  },
  deltx(e) {
    let index = e.currentTarget.dataset.index;
    let list = this.data.txlist;
    list.splice(index, 1);
    console.log(list)
    this.setData({
      txlist: list
    })
  },
  addpro(params, ists) {
    req({
      url: util.baseUrl + '/newapi/api/tj/persontj',
      method: "POST",
      data: params,
      success: res => {
        if (res.data.status) {
          if (ists) {
            wx.showToast({
              title: '预约成功',
            })
          }
          this.setData({
            mobile: "",
            xinmin: "",
            sex: "",
            time: "",
            cardno: "",
            hunyin: "",
            corp: "",
            fromsource: "",
            product: "",
            weijindate: ""
          })
        } else {
          wx.showModal({
            title: '预约失败',
            showCancel: false,
            content: res.data.data,
            success(res) {}
          })
        }
      }
    })
  },
  cancal() {

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

  // 问卷相关方法
  // 关闭问卷弹窗
  closeQuestionnaire() {
    this.setData({
      showQuestionnaire: false
    });
  },

  // 跳过问卷
  skipQuestionnaire() {
    this.setData({
      showQuestionnaire: false
    });
    wx.showToast({
      title: '已跳过问卷',
      icon: 'success'
    });
  },

  // 姓名输入
  onNameInput(e) {
    const value = e.detail.value;
    console.log('输入姓名：', value);
    this.setData({
      'questionnaire.name': value
    });
  },
  
  // 单选选项
  selectOption(e) {
    const { field, value } = e.currentTarget.dataset;
    console.log('选择单选项：', field, value);
    this.setData({
      [`questionnaire.${field}`]: value
    });
  },
  
  // 检查选项是否被选中（辅助方法）
  isOptionSelected(field, value) {
    const arr = this.data.questionnaire[field];
    return arr && arr.includes(value);
  },

  // 多选选项
  toggleMultiOption(e) {
    const { field, value } = e.currentTarget.dataset;
    console.log('点击多选项：', field, value);
    
    const questionnaire = { ...this.data.questionnaire };
    const currentArray = questionnaire[field] || [];
    console.log('当前数组：', currentArray);
    let newArray = [...currentArray];
    
    // 如果选择"以上均无"或"无"，清空其他选项
    if (value === '以上均无' || value === '无') {
      newArray = newArray.includes(value) ? [] : [value];
    } else {
      // 如果选择其他选项，移除"以上均无"和"无"
      newArray = newArray.filter(item => item !== '以上均无' && item !== '无');
      
      if (newArray.includes(value)) {
        newArray = newArray.filter(item => item !== value);
      } else {
        newArray.push(value);
      }
    }
    
    console.log('新数组：', newArray);
    
    // 更新questionnaire对象
    questionnaire[field] = newArray;
    
    // 更新整个questionnaire对象，确保视图刷新
    this.setData({
      questionnaire: questionnaire
    }, () => {
      console.log('更新后的数据：', this.data.questionnaire[field]);
    });
  },

  // 选择日期
  selectDate(e) {
    this.setData({
      'questionnaire.birthDate': e.detail.value
    });
  },

  // 提交问卷
  submitQuestionnaire() {
    const questionnaire = this.data.questionnaire;
    
    // 基本验证
    if (!questionnaire.name) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!questionnaire.ethnicity) {
      wx.showToast({
        title: '请选择民族',
        icon: 'none'
      });
      return;
    }
    
    if (!questionnaire.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    // 组装提交数据，字段名对应后端 brprequestionnaire 表结构
    const submitData = {
      name: questionnaire.name || '',
      nation: questionnaire.ethnicity || '',  // ethnicity -> nation
      gender: questionnaire.gender || '',
      birth_date: questionnaire.birthDate || '',
      marital_status: questionnaire.maritalStatus || '',
      family_disease_history: questionnaire.familyDiseases ? questionnaire.familyDiseases.join(',') : '',
      family_cancer_history: questionnaire.familyCancers ? questionnaire.familyCancers.join(',') : '',
      personal_disease_history: questionnaire.personalDiseases ? questionnaire.personalDiseases.join(',') : '',
      surgery_history: questionnaire.surgeryHistory || '',
      blood_transfusion_history: questionnaire.transfusionHistory || '',
      infectious_disease_history: questionnaire.infectiousDiseases ? questionnaire.infectiousDiseases.join(',') : '',
      personal_cancer_history: questionnaire.personalCancers ? questionnaire.personalCancers.join(',') : '',
      occupation: questionnaire.occupation || '',
      physical_exam_situation: questionnaire.checkupFrequency || '',
      allergy_history: questionnaire.allergyHistory || '',
      openid: wx.getStorageSync('openid') || ''
    };
    
    console.log('提交问卷数据:', submitData);
    
    // 调用接口提交
    req({
      url: util.baseUrl + '/newapi/api/pretj/saveprequestionnaire',
      method: 'POST',
      data: submitData,
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.status) {
          // 提交成功
          this.setData({
            showQuestionnaire: false
          });
          
          wx.showToast({
            title: '问卷提交成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          // 提交失败
          wx.showToast({
            title: res.data.msg || '提交失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交问卷失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '个人体检',
      path: '/pages/gerentijian/gerentijian?fromid=' + wx.getStorageSync('openid')
    }
  }
})