// custom-tab-bar/index.js
Component({
  /**
   * 组件的初始数据
   */
  data: {
    selected: 0, // 当前选中的下标
    "selectedColor": "#4e4e4e",
    "color": "#999999",
    "list": [{
        "pagePath": "/pages/index/index",
        "iconPath": "../pages/assign/newsy.png",
        "selectedIconPath": "../pages/assign/newsy-active.png",
        "text": "慧医宝首页",
        "type": "text",
        "routype": "switchTab"
      }, {
        "pagePath": "/subpackages/qyProList/qyProList",
        "iconPath": "../pages/assign/sp.png",
        "selectedIconPath": "../pages/assign/sp-active.png",
        "text": "产品",
        "type": "text",
        "routype": "redirectTo"
      },

      // {
      //   "bulge": true,
      //   "pagePath": "/pages/jiankangjie/jiankangjie",
      //   "iconPath": "../pages/assign/jkj.png",
      //   "selectedIconPath": "../pages/assign/jkj.png",
      //   "text": "女性健康节",
      //   "type": "text"
      // },
      {
        "pagePath": "/subpackages/qiyeOrder/qiyeOrder",
        "iconPath": "../pages/assign/orderIcon.png",
        "selectedIconPath": "../pages/assign/orderIcon.png",
        "text": "订单",
        "type": "text",
        "routype": "redirectTo"
      },
      {
        "pagePath": "/subpackages/qiyeHome/qiyeHome",
        "iconPath": "../pages/assign/newmy.png",
        "selectedIconPath": "../pages/assign/newmy-active.png",
        "text": "我的",
        "type": "text",
        "routype": "redirectTo"
      }
    ]
  },
  attached() {},
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx[data.routype]({
        url
      })
    },
    wu() {

    }
  }
})