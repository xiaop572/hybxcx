const materialBase = 'https://wx.pmc-wz.com/materials/'

Page({
  data: {
    assets: {
      coverBg: materialBase + 'health-passport-cover-bg.png'
    },
    features: [
      {
        title: '绑定亲人',
        desc: '一次授权 长期守护',
        icon: materialBase + 'health-passport-bind-family.png',
        theme: 'pink'
      },
      {
        title: '健康档案',
        desc: '病历检验一目了然',
        icon: materialBase + 'health-passport-health-records.png',
        theme: 'blue'
      },
      {
        title: '在线预约',
        desc: '体检门诊远程代约',
        icon: materialBase + 'health-passport-online-appointment.png',
        theme: 'purple'
      },
      {
        title: '跨境可用',
        desc: '身在海外 守护不缺席',
        icon: materialBase + 'health-passport-cross-border.png',
        theme: 'cyan'
      }
    ]
  },

  enterPassport() {
    wx.showToast({
      title: '健康护照功能建设中',
      icon: 'none'
    })
  }
})
