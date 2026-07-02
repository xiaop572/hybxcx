const materialBase = 'https://wx.pmc-wz.com/materials/'

function navigateTo(url) {
  const navigate = wx.myNavigateTo || wx.navigateTo
  navigate({ url })
}

const bookingRoutes = {
  physical: '/pages/gerentijian/gerentijian',
  clinic: '/pages/doctorAppoint/doctorAppoint'
}

const recordRoutes = {
  report: '/subpackagesC/healthphysicalreport/healthphysicalreport',
  physicalAppointment: '/subpackagesC/healthphysicalappointment/healthphysicalappointment',
  registration: '/subpackagesC/healthregistration/healthregistration'
}

function parseIdCardInfo(cardno) {
  const id = String(cardno || '').trim().toUpperCase()
  if (!id) {
    return {}
  }

  const getAge = (year, month, day) => {
    const birthDate = new Date(year, month, day)
    if (Number.isNaN(birthDate.getTime())) {
      return ''
    }
    const now = new Date()
    let age = now.getFullYear() - birthDate.getFullYear()
    const monthDiff = now.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age -= 1
    }
    return age >= 0 ? age : ''
  }

  if (/^\d{17}[\dX]$/.test(id)) {
    const gender = Number(id.charAt(16)) % 2 === 1 ? '男' : '女'
    return {
      gender,
      genderIcon: gender === '男' ? '♂' : '♀',
      genderClass: gender === '男' ? 'male' : 'female',
      ageText: (() => {
        const age = getAge(Number(id.slice(6, 10)), Number(id.slice(10, 12)) - 1, Number(id.slice(12, 14)))
        return age === '' ? '--' : age + '岁'
      })()
    }
  }

  if (/^\d{15}$/.test(id)) {
    const gender = Number(id.charAt(14)) % 2 === 1 ? '男' : '女'
    return {
      gender,
      genderIcon: gender === '男' ? '♂' : '♀',
      genderClass: gender === '男' ? 'male' : 'female',
      ageText: (() => {
        const age = getAge(1900 + Number(id.slice(6, 8)), Number(id.slice(8, 10)) - 1, Number(id.slice(10, 12)))
        return age === '' ? '--' : age + '岁'
      })()
    }
  }

  return {}
}

function buildQuery(params) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => key + '=' + encodeURIComponent(params[key]))
    .join('&')
}

function buildPhysicalBookingUrl(member, fallbackName) {
  const source = member || {}
  const raw = source.raw || {}
  const cardno = String(source.sfzh || raw.sfzh || raw.SFZH || raw.cardno || raw.cardNo || '').trim()
  const parsed = parseIdCardInfo(cardno)
  const params = {
    name: source.name || fallbackName || raw.brxm || raw.name || raw.realname || '',
    phone: source.phone || raw.yddh || raw.mobile || raw.phone || '',
    cardno
  }

  if (parsed.gender) {
    params.sex = parsed.gender
  }
  if (/^\d{17}[\dXx]$/.test(cardno)) {
    params.sfztype = '居民身份证'
  }
  return '/pages/gerentijian/gerentijian?' + buildQuery(params)
}

Page({
  data: {
    person: {
      name: '王秀英',
      gender: '',
      genderIcon: '',
      genderClass: '',
      ageText: '',
      cardCount: 1,
      reportCount: 3,
      appointmentCount: 2
    },
    bookingActions: [
      {
        key: 'physical',
        title: '预约体检',
        desc: '选套餐/选日期/一键约',
        icon: materialBase + 'health-passport-book-physical.png',
        theme: 'blue'
      },
      {
        key: 'clinic',
        title: '预约挂号',
        desc: '选科室/选医生/抢号',
        icon: materialBase + 'health-passport-book-clinic.png',
        theme: 'pink'
      }
    ],
    recordItems: [
      {
        key: 'card',
        title: '就诊卡',
        icon: materialBase + 'health-passport-medical-card.png'
      },
      {
        key: 'report',
        title: '体检报告',
        icon: materialBase + 'health-passport-physical-report.png',
        badge: 1
      },
      {
        key: 'physicalAppointment',
        title: '体检预约',
        icon: materialBase + 'health-passport-physical-appointment.png'
      },
      {
        key: 'registration',
        title: '挂号记录',
        icon: materialBase + 'health-passport-registration-record.png'
      }
    ]
  },

  onLoad(options) {
    if (options && options.name) {
      this.setData({
        'person.name': decodeURIComponent(options.name)
      })
    }
    if (options && options.phone) {
      this.setData({
        'person.phone': decodeURIComponent(options.phone)
      })
    }
    if (options && options.sfzh) {
      this.setData({
        'person.sfzh': decodeURIComponent(options.sfzh)
      }, () => {
        this.syncPersonInfo()
      })
    } else {
      this.syncPersonInfo()
    }
  },

  onShow() {
    this.syncPersonInfo()
  },

  syncPersonInfo() {
    const optionsId = this.data.person.sfzh || ''
    const currentMember = wx.getStorageSync('healthpassport_current_member') || {}
    const realInfo = wx.getStorageSync('realInfo') || {}
    const cardno = optionsId || currentMember.sfzh || (currentMember.raw && (currentMember.raw.sfzh || currentMember.raw.SFZH || currentMember.raw.cardno || currentMember.raw.cardNo)) || realInfo.cardno || realInfo.sfzh || ''
    const parsed = parseIdCardInfo(cardno)
    const patch = {}

    if (this.data.person.name === '王秀英' && currentMember.name) {
      patch['person.name'] = currentMember.name
    } else if (realInfo.realname && this.data.person.name === '王秀英') {
      patch['person.name'] = realInfo.realname
    }
    if (!this.data.person.phone && (currentMember.phone || currentMember.raw && (currentMember.raw.yddh || currentMember.raw.mobile || currentMember.raw.phone))) {
      patch['person.phone'] = currentMember.phone || currentMember.raw.yddh || currentMember.raw.mobile || currentMember.raw.phone || ''
    }
    if (cardno) {
      patch['person.sfzh'] = cardno
    }
    if (parsed.gender) {
      patch['person.gender'] = parsed.gender
      patch['person.genderIcon'] = parsed.genderIcon
      patch['person.genderClass'] = parsed.genderClass
    }
    if (parsed.ageText) {
      patch['person.ageText'] = parsed.ageText
    }

    if (Object.keys(patch).length) {
      this.setData(patch)
    }
  },

  tapBooking(e) {
    const key = e.currentTarget.dataset.key
    const currentMember = wx.getStorageSync('healthpassport_current_member') || {}
    const url = key === 'physical'
      ? buildPhysicalBookingUrl({
        ...currentMember,
        name: this.data.person.name,
        phone: this.data.person.phone,
        sfzh: this.data.person.sfzh
      }, this.data.person.name)
      : bookingRoutes[key]
    if (url) {
      navigateTo(url)
    }
  },

  tapRecord(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'card') {
      navigateTo('/subpackagesC/healthcards/healthcards?name=' + encodeURIComponent(this.data.person.name) + '&phone=' + encodeURIComponent(this.data.person.phone || ''))
      return
    }
    if (key === 'registration') {
      const currentCard = wx.getStorageSync('healthpassport_current_card') || {}
      const currentMember = wx.getStorageSync('healthpassport_current_member') || {}
      const params = {
        name: currentCard.name || this.data.person.name || currentMember.name || '',
        phone: currentCard.phone || this.data.person.phone || currentMember.phone || '',
        cardNo: currentCard.cardNo || '',
        sfzh: currentCard.sfzh || currentMember.sfzh || ''
      }
      navigateTo('/subpackagesC/healthregistration/healthregistration?' + buildQuery(params))
      return
    }
    if (key === 'physicalAppointment') {
      const currentMember = wx.getStorageSync('healthpassport_current_member') || {}
      const raw = currentMember.raw || {}
      const params = {
        name: this.data.person.name || currentMember.name || '',
        phone: this.data.person.phone || currentMember.phone || raw.yddh || raw.YDDH || raw.mobile || raw.phone || '',
        sfzh: this.data.person.sfzh || currentMember.sfzh || raw.sfzh || raw.SFZH || raw.cardno || raw.cardNo || ''
      }
      navigateTo('/subpackagesC/healthphysicalappointment/healthphysicalappointment?' + buildQuery(params))
      return
    }
    if (key === 'report') {
      const currentMember = wx.getStorageSync('healthpassport_current_member') || {}
      const raw = currentMember.raw || {}
      const params = {
        name: this.data.person.name || currentMember.name || '',
        phone: this.data.person.phone || currentMember.phone || raw.yddh || raw.YDDH || raw.mobile || raw.phone || '',
        sfzh: this.data.person.sfzh || currentMember.sfzh || raw.sfzh || raw.SFZH || raw.cardno || raw.cardNo || ''
      }
      navigateTo('/subpackagesC/healthphysicalreport/healthphysicalreport?' + buildQuery(params))
      return
    }
    const url = recordRoutes[key]
    if (url) {
      navigateTo(url)
    }
  }
})
