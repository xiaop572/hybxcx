Page({
  data: {
    imgBase: 'https://wx.pmc-wz.com/materials/',
    qiaopiList: [
      'https://wx.pmc-wz.com/materials/qiaopi1.png',
      'https://wx.pmc-wz.com/materials/qiaopi2.png',
      'https://wx.pmc-wz.com/materials/qiaopi3.png',
      'https://wx.pmc-wz.com/materials/qiaopi4.png',
      'https://wx.pmc-wz.com/materials/qiaopi5.png',
      'https://wx.pmc-wz.com/materials/qiaopi6.png',
      'https://wx.pmc-wz.com/materials/qiaopi7.png',
      'https://wx.pmc-wz.com/materials/qiaopi8.png',
      'https://wx.pmc-wz.com/materials/qiaopi9.png'
    ],
    productSections: [
      {
        title: 'https://wx.pmc-wz.com/materials/zszx.png',
        slogan: 'https://wx.pmc-wz.com/materials/nsqdct.png',
        products: [
          { id: 3066, img: 'https://wx.pmc-wz.com/materials/qlpro1.png' },
          { id: 3067, img: 'https://wx.pmc-wz.com/materials/qlpro2.png' },
          { id: 3068, img: 'https://wx.pmc-wz.com/materials/qlpro3.png' }
        ]
      },
      {
        slogan: 'https://wx.pmc-wz.com/materials/snywd.png',
        products: [
          { id: 3065, img: 'https://wx.pmc-wz.com/materials/qlpro4.png' }
        ]
      },
      {
        title: 'https://wx.pmc-wz.com/materials/paddz.png',
        products: [
          { id: 3061, img: 'https://wx.pmc-wz.com/materials/qlpro5.png' },
          { id: 3062, img: 'https://wx.pmc-wz.com/materials/qlpro6.png' }
        ]
      }
    ]
  },
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&')
      if (arr.length < 2) arr = options.scene.split('%26')
      wx.setStorageSync('sponsor', arr[0])
    }
  },
  goCheckup() {
    wx.navigateTo({
      url: '/pages/basicPro/basicPro?mername=%E4%BD%93%E6%A3%80&id=60'
    })
  },

  receiveGift() {
    wx.navigateTo({
      url: '/pages/tcxq/tcxq?id=3057'
    })
  },

  openQiaopiStory() {
    wx.navigateTo({
      url: '/huodongpage/fxgs/fxgs'
    })
  },

  buyProduct(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({
      url: `/pages/tcxq/tcxq?id=${id}`
    })
  },

  onShareAppMessage() {
    return {
      imageUrl: "https://wx.pmc-wz.com/materials/qlftx.jpg",
      title: '到院即享玻尿酸，凭影票体检赠加项，多重健康美福利，为阿嬷开启第二人生！',
      path: '/pages/zthd2/zthd2?fromid=' + wx.getStorageSync('openid')
    }
  }
})
