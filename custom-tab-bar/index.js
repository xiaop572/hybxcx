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
        "text": "首页",
        "type": "text"
      }, {
        "pagePath": "/pages/skipPage/skipPage",
        "iconPath": "../pages/assign/sp.png",
        "selectedIconPath": "../pages/assign/sp-active.png",
        "text": "全部商品",
        "type": "text"
      },
      // {
      //   "pagePath": "/pages/yiliaofuwu/yiliaofuwu",
      //   "iconPath": "../pages/assign/yl.png",
      //   "selectedIconPath": "../pages/assign/yl-active.png",
      //   "text": "医疗服务",
      //   "type": "text"
      // },
      {
        "pagePath": "/pages/jifu/jifu",
        "iconPath": "../pages/assign/pthd.png",
        "selectedIconPath": "../pages/assign/pthd.png",
        "text": "健康美就是福",
        "type": "text",
        "bulge":true
      },
      {
        "pagePath": "/pages/lxkf/lxkf",
        "iconPath": "../pages/assign/kefu.png",
        "selectedIconPath": "../pages/assign/kefu.png",
        "text": "客服",
        "type": "contact"
      },
      {
        "pagePath": "/pages/my/my",
        "iconPath": "../pages/assign/newmy.png",
        "selectedIconPath": "../pages/assign/newmy-active.png",
        "text": "我的",
        "type": "text"
      }
    ]
  },
  attached() {},
  methods: {
    switchTab(e) {
      console.log(this.data)
      const data = e.currentTarget.dataset
      console.log(data)
      const url = data.path
      wx.switchTab({
        url
      })
    },
    wu(){
      
    }
  }
})