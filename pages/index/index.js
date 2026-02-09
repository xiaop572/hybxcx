// index.js
// 获取应用实例
const app = getApp()
const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
Page({
  data: {
    articleList: [],
    imgBaseUrl: util.imgBaseUrl,
    rollSpeed: 15,
    timer: null,
    rollLeft: 750,
    youxuanList: [],
    xihuanList: [],
    xianshiList: [],
    bannerList: [],
    setnickvis: false,
    nickname: "",
    zxlist:[],
    splist:[],
    ymrblist:[],
    tjrblist:[],
    ckrblist:[],
    showCard:false
  },
  ryimiao(){
    wx.navigateTo({
      url: '../tcxq/tcxq?id=1601',
    })
  },
  onShow() {
    // wx.getLocation({
    //   success: function (res) {
    //     console.log("纬度：" + res.latitude, "经度" + res.longitude)
    //   },
    // })
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    let token = wx.getStorageSync('token');
    wx.setStorageSync('realInfo', {
      ...wx.getStorageSync('realInfo')
    });
    let realInfo = wx.getStorageSync('realInfo');
    // this.juBick()
    this.getzx()
    this.getsph();
    this.getymrb();
    this.gettjrb();
    this.getckrb();
    // if (!token) {
    //   wx.redirectTo({
    //     url: '../login/login',
    //   })
    // }
    // if (!realInfo.mobile) {
    //   wx.navigateTo({
    //     url: '../getPhone/getPhone',
    //   })
    // }
  },
  getymrb(){
    req({
      url:util.baseUrl+"/newapi/api/xys/goodsyimeirb",
      method:"POST",
      data:{
        limit:9999
      },
      success:(res)=>{
        this.setData({
          ymrblist:res.data.data
        })
      }
    })
  },
  gettjrb(){
    req({
      url:util.baseUrl+"/newapi/api/xys/goodstjrb",
      method:"POST",
      data:{
        limit:9999
      },
      success:(res)=>{
        this.setData({
          tjrblist:res.data.data
        })
      }
    })
  },
  getckrb(){
    req({
      url:util.baseUrl+"/newapi/api/xys/goodsckrb",
      method:"POST",
      data:{
        limit:9999
      },
      success:(res)=>{
        this.setData({
          ckrblist:res.data.data
        })
      }
    })
  },
  getzx(){
    req({
      url:util.baseUrl+"/newapi/api/cms/allnews",
      method:"POST",
      data:{
        curpage:1,
        limit:6,
        typeid:0,
        searchkey:""
      },
      success:(res)=>{
        this.setData({
          zxlist:res.data.data
        })
      }
    })
  },
  getsph(){
    req({
      url:util.baseUrl+"/newapi/api/cms/allvideo",
      method:"POST",
      data:{
        curpage:1,
        limit:6,
        typeid:0,
        searchkey:""
      },
      success:(res)=>{
        this.setData({
          splist:res.data.data
        })
      }
    })
  },
 
  rjkkp(e){
    wx.navigateTo({
      url: '../../subpackages/zxlist/zxlist?index='+e.currentTarget.dataset.index,
    })
  },
  rylfw(){
    // wx.switchTab({
    //   url: '../yiliaofuwu/yiliaofuwu',
    // })
    wx.navigateTo({
      url: '../yiliaofuwu/yiliaofuwu',
    })
  },
  rdiagnosis(){
    wx.navigateTo({
      url: '/subpackagesC/diagnosis/diagnosis',
    })
  },
  rjzzx(){
    
    wx.navigateTo({
      url: '/subpackagesC/medical-survey/medical-survey',
    })
  },
  ryysc(){
    wx.navigateTo({
      url: '/subpackagesC/dzhc/dzhc',
    })
  },
  rmy(){
    wx.switchTab({
      url: '../my/my',
    })
  },
  rzqhd(){
    wx.navigateTo({
      url: '../zqhd/zqhd'
    })
  },
  rqy() {
    wx.navigateTo({
      url: "../../subpackages/qiyezhuce/qiyezhuce"
    })
  },
  rzxxq(e){
    wx.navigateTo({
      url: '../../subpackages/zxcontent/zxcontent?id='+e.currentTarget.dataset.id,
    })
  },
  rsphlist(){
    wx.navigateTo({
      url: '../../subpackages/sphlist/sphlist',
    })
  },
  rspxq(e){
    wx.navigateTo({
      url: '../../subpackages/sph/sph?id='+e.currentTarget.dataset.id,
    })
  },
  setnick() {
    if (!this.data.nickname) {
      wx.showToast({
        title: '请填写昵称',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/WechatUser/setnickname",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        nickname: this.data.nickname
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            setnickvis: false
          })
          req({
            url: util.baseUrl + "/newapi/api/WechatUser/getqrinfo",
            data: {
              openid: wx.getStorageSync('openid')
            },
            success: reso => {
              if (reso.data.data) {
                wx.setStorageSync('qrinfo', reso.data.data)
              }
            }
          })
        }
      }
    })
  },
  juBick() {
    let qrinfo = wx.getStorageSync('qrinfo')
    let isLogin=wx.getStorageSync('isLogin')
    console.log(typeof qrinfo, "qrinfo")
    if (isLogin && (qrinfo.nickname == "微信用户" || qrinfo.nickname == "" || qrinfo.nickname == null)) {
      this.setData({
        setnickvis: true
      })
    }
  },
  timer2: null,
  rqmkxj() {
    wx.switchTab({
      url: "../qmkxj/qmkxj"
    })
  },
  rmspro(){
    wx.navigateTo({
      url: '/subpackages/zqhd/zqhd',
    })
  },
  jkhq(){
    wx.navigateTo({
      url:"/subpackages/jkhq/jkhq"
    })
  },
  jkhq2(){
    this.setData({
      showCard:false
    })
    wx.navigateTo({
      url:"/subpackages/jkhq/jkhq"
    })
  },
  ryouxiang() {
    wx.navigateTo({
      url: '../../subpackages/youxiang/youxiang',
    })
  },
  rmiaosha() {
    wx.navigateTo({
      url: '../../subpackages/miaoshaList/miaoshaList',
    })
  },
  rettf() {
    wx.navigateTo({
      url: '../tcxq/tcxq?id=85',
    })
  },
  rxscyimei() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
      path: '/pages/list/list?cat_id=7'
    })
  },
  rgwytj() {
    wx.navigateTo({
      url: '../../subpackages/gongwuyuantijian/gongwuyuantijian',
    })
  },
  rqd() {
    wx.switchTab({
      url: '../qiandaoHome/qiandaoHome',
    })
  },
  rdakanei() {
    wx.navigateTo({
      url: '../../subpackages/daka/daka'
    })
  },
  rxianshi() {
    wx.navigateTo({
      url: '../../subpackages/xianshiPro/xianshiPro',
    })
  },
  rxinpin() {
    wx.navigateTo({
      url: '../../subpackages/xinpinPro/xinpinPro',
    })
  },
  rSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  rxscyuezi() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
      path: '/pages/list/list?cat_id=10'
    })
  },
  rxsctijian() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
      path: '/pages/list/list?cat_id=8'
    })
  },
  rxsckouqiang() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
      path: '/pages/list/list?cat_id=9'
    })
  },
  rxscerbao() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
      path: '/pages/list/list?cat_id=105'
    })
  },
  rReport() {
    wx.navigateTo({
      url: '../report/report'
    })
  },
  getyouxuanPro() {
    req({
      url: util.baseUrl + "/frontapi/api/goods/getyouxuanlist",
      method: "POST",
      data: {
        limit: 4
      },
      success: res => {
        this.setData({
          youxuanList: res.data.data
        })
      }
    })
  },
  getxihuanPro() {
    req({
      url: util.baseUrl + "/frontapi/api/goods/getxihuanlist",
      method: "POST",
      data: {
        limit: 4
      },
      success: res => {
        this.setData({
          xihuanList: res.data.data
        })
      }
    })
  },
  getxianshiPro() {
    req({
      url: util.baseUrl + "/frontapi/api/goods/goodsxianshi",
      method: "POST",
      data: {
        limit: 3
      },
      success: res => {
        this.setData({
          xianshiList: res.data.data
        })
      }
    })
  },
  rBasicPro(e) {
    wx.navigateTo({
      url: "../basicPro/basicPro?mername=" + e.currentTarget.dataset.mername + "&id=" + e.currentTarget.dataset.id
    })
  },
  rskip() {
    wx.switchTab({
      url: '../skipPage/skipPage',
    })
  },
  rAcrossBasicPro(e) {
    wx.navigateTo({
      url: "../acrossBasicPro/acrossBasicPro?mername=" + e.currentTarget.dataset.mername + "&id=" + e.currentTarget.dataset.id
    })
  },
  rdwtj() {
    wx.navigateTo({
      url: '../danweitijian/danweitijian'
    })
  },
  rtjyy() {
    wx.navigateTo({
      url: '../../subpackages/tjSelect/tjSelect'
    })
  },
  rlxkf() {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.switchTab({
              url: '../login/login',
            })
          }, 1000)
        }
      })
      return;
    } else {
      wx.getSetting({
        withSubscriptions: true,
        success: res => {
          if (res.subscriptionsSetting.Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU === "accept") {
            wx.switchTab({
              url: '../lxkf/lxkf'
            })
          } else {
            wx.requestSubscribeMessage({
              tmplIds: ['Ix_tsFlUJyPPfeEQkqDcQPfzEQnwMeJtFqDKlMg4bhU'],
              success: res => {
                wx.switchTab({
                  url: '../lxkf/lxkf'
                })
              }
            })
          }
        }
      })
    }
  },
  rMz() {
    wx.navigateTo({
      url: '../doctorAppoint/doctorAppoint'
    })
  },
  rshangcheng() {
    wx.navigateToMiniProgram({
      appId: 'wx89a04b50761fff30',
    })
  },
  rZjjs() {
    wx.navigateTo({
      url: '../zjjs/zjjs'
    })
  },
  rtjhd() {
    wx.navigateTo({
      url: '../tjhdlist/tjhdlist'
    })
  },
  rzxhd() {
    wx.navigateTo({
      url: '../hdsgz/hdsgz'
    })
  },
  rArticleTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../article/article?id=' + id
    })
  },
  rExperProgam() {
    wx.navigateTo({
      url: '../jianyankaidan/jianyankaidan',
    })
  },
  rzxka() {
    wx.navigateTo({
      url: '../tcxq/tcxq?id=36',
    })
  },
  rkqzm() {
    wx.navigateTo({
      url: '../../subpackages/kqzm/kqzm',
    })
  },
  rtcxq() {
    wx.navigateTo({
      url: '../tcxq/tcxq?id=31',
    })
  },
  rtcxq2(e) {
    wx.navigateTo({
      url: "../tcxq/tcxq?id=" + e.currentTarget.dataset.id
    })
  },
  ryyzf(e) {
    wx.navigateTo({
      url: '../yyhd-zf/yyhd-zf?id=' + e.currentTarget.dataset.id,
    })
  },
  getBannerList() {
    req({
      url: util.baseUrl + "/frontapi/api/goods/getbannerlist",
      method: "POST",
      data: {
        classid: 0
      },
      success: res => {
        this.setData({
          bannerList: res.data.data
        })
      }
    })
  },
  bannergo(e) {
    let data = e.currentTarget.dataset
    if (data.summary) {
      wx[data.summary]({
        url: data.gourl,
      })
    } else {
      wx.navigateTo({
        url: data.gourl,
      })
    }
  },
  // rExperProgam() {
  //   wx.myNavigateTo({
  //     url: '../yyhd/yyhd',
  //   })
  // },
  onLoad(options) {
    if(options.scene=='jkhq'){
      setTimeout(() => {
        this.setData({ showCard: true }, () => {
          console.log("??")
          this.initCanvas();
        });
      }, 1500);
    }
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene && options.scene!='jkhq') {
      let arr = options.scene.split('&');
      console.log(arr)
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id = arr[1]
    }
    if (options.sponsor) {
      wx.setStorageSync('sponsor', options.sponsor)
    }
    // req({
    //   url: util.baseUrl + '/frontapi/api/mindex/getwxarticlepage',
    //   method: "POST",
    //   data: {
    //     curpage: 1,
    //     limit: 10
    //   },
    //   success: res => {
    //     this.setData({
    //       articleList: res.data.data
    //     })
    //   }
    // })
    this.getyouxuanPro();
    this.getxihuanPro();
    this.getxianshiPro();
    this.getBannerList();
    if (options.fromid) {
      req({
        url: util.baseUrl + '/frontapi/api/mindex/tjadshare',
        method: "POST",
        data: {
          myopenid: wx.getStorageSync('openid'),
          parentid: options.fromid,
          typename: "慧医宝分享",
          typeid: 0
        }
      })
    }
  },
  onShareAppMessage() {
    return {
      title: '慧医宝',
      path: '/pages/index/index?fromid=' + wx.getStorageSync('openid')
    }
  },
  onShareTimeline() {
    return {
      title: '慧医宝',
      path: '/pages/index/index?fromid=' + wx.getStorageSync('openid')
    }
  },
  rQiandaoMain() {
    wx.navigateTo({
      url: '../qiandaoMain/qiandaoMain'
    })
  },
  onHide() {
    clearInterval(this.data.timer)
    if (this.timer2) {
      clearTimeout(this.timer2);
      this.timer2 = null;
    }
    this.setData({
      showCard:false
    })
  },
  initCanvas: function() {
    const query = wx.createSelectorQuery();
    query.select('#animCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // 设置canvas大小
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 初始化粒子数组
        this.particles = [];
        for (let i = 0; i < 80; i++) {
          this.particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 1,
            vx: Math.random() * 6 - 3,
            vy: Math.random() * 6 - 3,
            alpha: Math.random() * 0.5 + 0.5,
            color: `hsla(${Math.random() * 360}, 80%, 60%, 0.8)`
          });
        }

        // 动画循环
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 更新和绘制粒子
          this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 边界检查
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

            // 绘制粒子
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace('0.8', particle.alpha);
            ctx.fill();
            
            // 更新透明度
            particle.alpha = Math.sin(Date.now() / 1000 + particle.x) * 0.3 + 0.5;
          });

          // 绘制光束效果
          this.drawLightBeams(ctx, canvas.width, canvas.height);

          this.timer = setTimeout(animate, 16); // 约60fps的刷新率
        };

        animate();
      });
  },

  drawLightBeams: function(ctx, width, height) {
    const time = Date.now() / 1000;
    const lightSources = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width, y: height },
      { x: width / 2, y: height / 2 }
    ];

    lightSources.forEach((source, sourceIndex) => {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time + sourceIndex * 0.5;
        const gradient = ctx.createLinearGradient(
          source.x,
          source.y,
          source.x + Math.cos(angle) * width * 0.8,
          source.y + Math.sin(angle) * height * 0.8
        );

        const alpha = (Math.sin(time * 2 + sourceIndex) + 1) * 0.3 + 0.2;
        gradient.addColorStop(0, `rgba(255, 223, 186, ${alpha})`); 
        gradient.addColorStop(1, 'rgba(255, 223, 186, 0)');

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(
          source.x + Math.cos(angle) * width * 0.8,
          source.y + Math.sin(angle) * height * 0.8
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 15;
        ctx.stroke();
      }
    });
  }
})