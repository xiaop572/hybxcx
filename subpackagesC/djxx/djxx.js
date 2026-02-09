Page({
  data: {
    selectedType: 'personal',
    name: '',
    idTypes: ['身份证', '护照', '港澳通行证', '台胞证'],
    idTypeIndex: 0,
    idNumber: '',
    age: '',
    gender: 'male',
    maritalStatus: '',
    ethnicity: '',
    isPregnant: false,
    height: '',
    weight: '',
    autoSave: true
  },

  selectType(e) {
    this.setData({
      selectedType: e.currentTarget.dataset.type
    })
  },

  inputName(e) {
    this.setData({
      name: e.detail.value
    })
  },

  bindIdTypeChange(e) {
    this.setData({
      idTypeIndex: e.detail.value
    })
  },

  inputIdNumber(e) {
    this.setData({
      idNumber: e.detail.value
    })
  },

  inputAge(e) {
    this.setData({
      age: e.detail.value
    })
  },

  selectGender(e) {
    this.setData({
      gender: e.currentTarget.dataset.gender
    })
  },

  selectMaritalStatus(e) {
    this.setData({
      maritalStatus: e.currentTarget.dataset.status
    })
  },

  inputEthnicity(e) {
    this.setData({
      ethnicity: e.detail.value
    })
  },

  togglePregnant() {
    this.setData({
      isPregnant: !this.data.isPregnant
    })
  },

  inputHeight(e) {
    this.setData({
      height: e.detail.value
    })
  },

  inputWeight(e) {
    this.setData({
      weight: e.detail.value
    })
  },

  toggleAutoSave() {
    this.setData({
      autoSave: !this.data.autoSave
    })
  },

  nextStep() {
    // TODO: 表单验证和提交逻辑
    console.log('提交的表单数据：', this.data)
  }
})