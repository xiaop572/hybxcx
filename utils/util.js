const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
// const baseUrl="http://192.168.251.97:8030";
const baseUrl = "https://wx.pmc-wz.com";
const imgBaseUrl = "https://wx.pmc-wz.com/hyb/images/";
const externalUrl = "https://wx.pmc-wz.com/materials"
const realExist = function () {
  const realInfo = wx.getStorageSync('realInfo');
  if (realInfo.mobile && realInfo.realname && realInfo.cardno) {
    return true;
  }
  return false;
}
const setRealInfo = function (cb) {
  wx.request({
    url: baseUrl + '/newapi/api/WechatUser/getuserinfo',
    data: {
      openid: wx.getStorageSync('openid')
    },
    success: resss => {
      if (resss.data.data) {
        wx.setStorageSync('realInfo', resss.data.data)
        cb()
      }
    }
  })
}
const init = function () {
  wx.myNavigateTo = function (obj) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showModal({
        title: '提示',
        content: '请登录后使用',
        complete: (res) => {
          if (res.cancel) {
           return;
          }
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return;
    }else{
      wx.navigateTo({
        ...obj
      })
    }
    
  }
  wx.myRedirectTo = function (obj) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showModal({
        title: '提示',
        content: '请登录后使用',
        complete: (res) => {
          if (res.cancel) {
           return;
          }
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return;
    }else{
      wx.navigateTo({
        ...obj
      })
    }
  }
  wx.myNavigateToz = function (obj) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showModal({
        title: '提示',
        content: '请登录后使用',
        complete: (res) => {
          if (res.cancel) {
           return;
          }
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return;
    }else{
      wx.navigateTo({
        ...obj
      })
    }
  }
}
const fsm = wx.getFileSystemManager();
const FILE_BASE_NAME = 'tmp_base64src'; //自定义文件名

function base64src(base64data, cb) {
  const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
  if (!format) {
    return (new Error('ERROR_BASE64SRC_PARSE'));
  }
  const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
  const buffer = wx.base64ToArrayBuffer(bodyData);
  fsm.writeFile({
    filePath,
    data: buffer,
    encoding: 'binary',
    success() {
      cb(filePath);
    },
    fail() {
      return (new Error('ERROR_BASE64SRC_WRITE'));
    },
  });
};

function intervalTime(startTime, endTime) {
  // var timestamp=new Date().getTime(); //计算当前时间戳
  var timestamp = (Date.parse(new Date())) / 1000; //计算当前时间戳 (毫秒级)
  var date1 = ""; //开始时间
  if (timestamp < startTime) {
    date1 = startTime;
  } else {
    date1 = timestamp; //开始时间
  }
  var date2 = endTime; //结束时间
  // var date3 = date2.getTime() - date1.getTime(); //时间差的毫秒数
  var date3 = (date2 - date1); //时间差的毫秒数
  if (date3 < 0) {
    return false;
  }
  //计算出相差天数
  var days = Math.floor(date3 / (24 * 3600 * 1000));
  //计算出小时数

  var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000));
  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000));

  //计算相差秒数

  var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
  var seconds = Math.round(leave3 / 1000);
  return [days, hours, minutes, seconds]
  //return   days + "天 " + hours + "小时 "
}

function getDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10; //输出为米
  return s;
}

module.exports = {
  formatTime,
  baseUrl,
  imgBaseUrl,
  realExist,
  externalUrl,
  setRealInfo,
  init,
  base64src,
  intervalTime,
  getDistance
}