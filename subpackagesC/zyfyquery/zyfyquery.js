Page({
  data: {
    name: '',
    idCard: '',
    phone: ''
  },

  onNameInput(e) {
    this.setData({ name: String(e.detail.value || '').trim() })
  },

  onIdCardInput(e) {
    this.setData({ idCard: String(e.detail.value || '').replace(/\s/g, '') })
  },

  onPhoneInput(e) {
    this.setData({ phone: String(e.detail.value || '').replace(/\s/g, '') })
  },

  submit() {
    const name = this.data.name.trim()
    const idCard = this.data.idCard.trim()
    const phone = this.data.phone.trim()
    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!idCard) {
      wx.showToast({ title: '请输入身份证号', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }
    wx.setStorageSync('zyfyqdQuery', {
      name,
      idCard,
      phone
    })
    wx.navigateTo({
      url: '/subpackagesC/zyfylist/zyfylist'
    })
  }
})
