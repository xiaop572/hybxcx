const STORAGE_KEY = 'lianzhengCommitmentDraft'
const SIGNATURE_EDIT_KEY = 'lianzhengSignatureEditing'
const SIGNATURE_RESULT_KEY = 'lianzhengSignatureResult'

function getToday() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

Page({
  data: {
    title: '温州和平国际医院廉政行医承诺书',
    intro: '为严格遵守医疗卫生行业法律法规，落实《医疗机构工作人员廉洁从业九项准则》《医师法》《医疗保障基金使用监督管理条例》等规定，强化医德医风建设，筑牢廉洁行医、依法执业底线，自觉维护温州和平医院良好形象，保障患者合法权益，本人郑重作出如下廉政行医承诺：',
    sections: [
      {
        title: '一、坚守初心使命，依法规范执业',
        content: '自觉遵守国家医疗卫生法律法规、医院各项规章制度及诊疗技术规范，恪守救死扶伤、以人为本的职业宗旨。严格执行首诊负责、分级诊疗、查对核对等核心制度，规范诊疗流程，不违规执业、不超范围执业、不擅自开展未经审批的诊疗项目，杜绝一切违规违纪医疗行为。'
      },
      {
        title: '二、严守廉洁底线，杜绝收受回扣',
        content: '坚决杜绝医药购销、设备耗材采购、检查检验、手术治疗等全流程利益输送。绝不收受药品、器械、耗材、设备厂家及代理商的回扣、提成、礼金、有价证券、购物卡、礼品及各类宴请、旅游、娱乐等变相利益，不利用职务便利为商业营销提供便利，杜绝商业贿赂行为。'
      },
      {
        title: '三、拒收患者红包，恪守职业底线',
        content: '诊疗全过程坚持公平公正、文明服务，不索要、不暗示、不收受患者及家属的红包、礼金、礼品、微信转账、感谢费等各类财物。遇到患者主动馈赠，做到当场婉拒，无法当场退回的按医院规定统一登记上交，坚决杜绝以医谋私。'
      },
      {
        title: '四、规范诊疗行为，杜绝过度医疗',
        content: '严格遵循合理检查、合理用药、合理治疗、合理收费原则。不开大处方、滥用药、重复药，不开展不必要检查、过度治疗、过度耗材使用，不诱导患者消费、不夸大病情、不虚假诊疗。严格执行医保政策，杜绝分解住院、挂床住院、虚假计费、欺诈骗保等违规行为，守护医保基金安全。'
      },
      {
        title: '五、规范收费行为，杜绝乱收私收',
        content: '严格执行物价部门及医院统一收费标准，公开收费项目、收费标准，如实提供费用清单。不自立项目收费、超标准收费、分解项目收费，不私自收费、体外收费、截留患者费用，不利用职务便利谋取私利。'
      },
      {
        title: '六、严守执业纪律，规范执业行为',
        content: '不在院外私自开展有偿诊疗、私自出诊、私自手术；不为亲友及个人私利搭车开药、搭车检查、违规开单；不伪造病历、诊断证明、检查报告、休假证明等医疗文书，不篡改、隐匿、销毁医疗资料，杜绝医疗造假行为。'
      },
      {
        title: '七、规范转诊转介，杜绝牟利提成',
        content: '严格按照诊疗规范开展患者转诊、转介工作，不通过介绍患者至外院检查、治疗、购药、康复等方式谋取提成、回扣、好处费，不利用患者信息资源违规牟利，保障患者自主就医选择权。'
      },
      {
        title: '八、严守隐私规定，保护患者权益',
        content: '严格遵守医疗隐私保密制度，妥善保管患者病历、检查数据、个人信息、就诊记录等资料，不泄露、不传播、不售卖患者隐私信息，不随意对外披露诊疗信息，尊重患者知情权、选择权、隐私权。'
      },
      {
        title: '九、端正服务作风，提升行医行风',
        content: '坚持文明行医、礼貌服务，耐心接诊患者，认真解答咨询，不推诿、不冷漠、不刁难患者。杜绝态度生硬、推诿扯皮、医患纠纷激化等问题，主动维护和谐医患关系，树立温州和平医院廉洁、规范、温暖的行医形象。'
      },
      {
        title: '十、自觉接受监督，严守责任追究',
        content: '本人自愿接受医院纪检、质控、行风、院务及卫健部门、医保部门、社会群众的全程监督。若本人违反以上任何一项承诺，自愿接受医院通报批评、绩效考核扣除、岗位调整、停岗培训等院内处理；情节严重、触犯法律法规的，自愿接受行政处罚、吊销执业资质及法律追责，绝不推诿、不申诉。'
      }
    ],
    department: '',
    position: '',
    idCard: '',
    date: getToday(),
    signatureImage: ''
  },

  onLoad() {
    const draft = wx.getStorageSync(STORAGE_KEY) || {}
    this._draftSignatureImage = draft.signatureImage || ''
    this.setData({
      department: draft.department || '',
      position: draft.position || '',
      idCard: draft.idCard || '',
      date: draft.date || getToday(),
      signatureImage: draft.signatureImage || ''
    })
  },

  onShow() {
    const result = wx.getStorageSync(SIGNATURE_RESULT_KEY)
    if (!result || !result.signatureImage) {
      return
    }
    this._draftSignatureImage = result.signatureImage
    this.setData({ signatureImage: result.signatureImage })
    wx.removeStorageSync(SIGNATURE_RESULT_KEY)
  },

  openSignature() {
    wx.setStorageSync(SIGNATURE_EDIT_KEY, {
      signatureImage: this.data.signatureImage || this._draftSignatureImage || ''
    })
    wx.navigateTo({
      url: '../chengnuoshuqianming/chengnuoshuqianming'
    })
  },

  onDepartmentInput(e) {
    this.setData({ department: e.detail.value })
  },

  onPositionInput(e) {
    this.setData({ position: e.detail.value })
  },

  onIdCardInput(e) {
    this.setData({ idCard: e.detail.value.toUpperCase() })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  saveCommitment() {
    const { department, position, idCard, date, signatureImage } = this.data
    if (!department.trim()) {
      wx.showToast({ title: '请填写所在科室', icon: 'none' })
      return
    }
    if (!position.trim()) {
      wx.showToast({ title: '请填写岗位职务', icon: 'none' })
      return
    }
    if (!/^[0-9Xx]{15,18}$/.test(idCard.trim())) {
      wx.showToast({ title: '请填写正确的身份证号', icon: 'none' })
      return
    }
    if (!date) {
      wx.showToast({ title: '请选择承诺日期', icon: 'none' })
      return
    }
    if (!signatureImage) {
      wx.showToast({ title: '请完成手写签字', icon: 'none' })
      return
    }

    wx.setStorageSync(STORAGE_KEY, {
      department: department.trim(),
      position: position.trim(),
      idCard: idCard.trim().toUpperCase(),
      date,
      signatureImage,
      savedAt: Date.now()
    })
    wx.showToast({ title: '已保存本地草稿', icon: 'success' })
  }
})
