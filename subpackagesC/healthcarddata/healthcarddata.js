const materialBase = 'https://wx.pmc-wz.com/materials/'

function navigateTo(url) {
  const navigate = wx.myNavigateTo || wx.navigateTo
  navigate({ url })
}

const recordRoutes = {
  clinic: '/subpackages/cflist/cflist',
  imaging: '/subpackages/yxList/yxList',
  lab: '/subpackages/jianyanList/jianyanList',
  pathology: '/pages/blbg/blbg',
  inpatient: '/subpackages/zyjchome/zyjchome'
}

Page({
  data: {
    personName: '王秀英',
    cardNo: '****************',
    records: [
      {
        key: 'clinic',
        title: '门诊病历',
        desc: '就诊与用药记录',
        icon: materialBase + 'health-passport-outpatient-record.png',
        badge: 1
      },
      {
        key: 'imaging',
        title: '影像检查',
        desc: 'CT · B超 · X光',
        icon: materialBase + 'health-passport-imaging-exam.png'
      },
      {
        key: 'lab',
        title: '检验报告',
        desc: '血液 · 生化化验单',
        icon: materialBase + 'health-passport-lab-report.png'
      },
      {
        key: 'pathology',
        title: '病理报告',
        desc: '活检 · 病理诊断',
        icon: materialBase + 'health-passport-pathology-report.png'
      },
      {
        key: 'inpatient',
        title: '住院记录',
        desc: '住院与出院小结',
        icon: materialBase + 'health-passport-inpatient-record.png'
      }
    ]
  },

  onLoad(options) {
    if (options && options.name) {
      this.setData({
        personName: decodeURIComponent(options.name)
      })
    }
    if (options && options.cardNo) {
      this.setData({
        cardNo: decodeURIComponent(options.cardNo)
      })
    } else {
      const currentCard = wx.getStorageSync('healthpassport_current_card') || {}
      if (currentCard.cardNo) {
        this.setData({
          cardNo: currentCard.cardNo
        })
      }
    }
  },

  openRecord(e) {
    const key = e.currentTarget.dataset.key
    const url = recordRoutes[key]
    if (url) {
      navigateTo(url)
    }
  }
})
