const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
const recorderManager = wx.getRecorderManager() //这是录音功能的实例，必须的
const innerAudioContext = wx.createInnerAudioContext(); //这是播放录音功能需要的实例
Page({
  data: {
    show: true,
    sendInput: "",
    tempFilePath: "",
    chatList: [],
    myOpenid: "",
    scrollLast: null,
    forGetchatList: null,
    fromid: "",
    fromname: "",
    moveHeight: 110,
    enterHeight: 70,
    state: true
  },
  onLoad: function (e) {
    this.setData({
      fromid: e.fromid,
      myOpenid: wx.getStorageSync('openid'),
      fromname: e.fromname
    })
    this.getChatList(true);
    this.data.forGetchatList = setInterval(() => {
      this.getChatList(true);
    }, 2000);
  },
  onUnload() {
    clearInterval(this.data.forGetchatList)
  },
  changeInType() {
    this.setData({
      show: !this.data.show
    })
  },
  openTable() {
    this.setData({
      moveHeight: 310,
      enterHeight: 270,
      state: false
    })
  },
  closeTable() {
    this.setData({
      moveHeight: 110,
      enterHeight: 70,
      state: true
    })
  },
  selectImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: (res) => {
        let tempFilePaths = res.tempFiles; // 返回选定照片的本地路径列表 
        this.uploadImg(tempFilePaths);
      }
    })
  },
  magnify(e){ //放大图片
    this.setData({
      magnifyImg:e.currentTarget.dataset.imgsrc
    })
  },
  closeMagn(){//关闭图片
    this.setData({
      magnifyImg:""
    })
  },
  uploadImg(path) { // 上传图片
    console.log(path, "path")
    wx.showToast({
      icon: "loading",
      title: "正在上传……"
    });
    wx.uploadFile({
      url: '上传图片接口url', //后端接口
      filePath: path[0].tempFilePath,
      name: 'file', //这个随便填
      url: util.baseUrl + '/newapi/api/chat/uploadimg', //填写自己服务器的地址。
      header: {
        "Content-Type": "multipart/form-data", //必须是这个格式
        Authorization: 'Bearer ' + wx.getStorageSync('token')
      },
      formData: {
        "toid": this.data.fromid,
        "fromid": wx.getStorageSync('openid'),
        "typeid": 5,
        "brbm": "",
        leftright:1
      },
      success:(res)=>{
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          });
          return;
        } else {
          console.log("上传成功！ 可对返回的值进行操作，比如：存入imgData；");
          this.getChatList()
        }
      },
      fail(e) {
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        });
      },
      complete() {
        wx.hideToast(); //隐藏Toast
      }
    })
  },
  sendText() {
    req({
      url: util.baseUrl + '/newapi/api/chat/talktext',
      method: "POST",
      data: {
        "typeid": 1,
        "brbm": "",
        "toid": this.data.fromid,
        "fromid": wx.getStorageSync('openid'),
        "content": this.data.sendInput,
        leftright:1
      },
      success: (res) => {
        this.setData({
          sendInput: ""
        })
        this.getChatList(true);
      }
    })
  },
  getChatList(scoll) {
    req({
      url: util.baseUrl + "/newapi/api/chat/getmangerchatlistpage",
      method: "POST",
      data: {
        "toid": this.data.fromid,
        "curpage": 1,
        "limit": 200
      },
      success: (res) => {
        if (scoll) {
          this.setData({
            chatList: res.data.data.reverse(),
            scrollLast: 'item' + res.data.data.length
          })
        } else {
          this.setData({
            chatList: res.data.data.reverse()
          })
        }

      }
    })
  },
  beginRecord: function (e) {
    // 监听录音开始事件
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    // 监听已录制完指定帧大小的文件事件。如果设置了 frameSize，则会回调此事件。
    recorderManager.onFrameRecorded((res) => {
      const {
        frameBuffer
      } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
    //录音的参数
    const options = {
      duration: 60000, //录音时间，默认是60s，提前松手会触发button的bindtouchend事件，执行停止函数并上传录音文件。超过60s不松手会如何并未测试过
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3', //录音格式，这里是mp3
      frameSize: 50 //指定帧大小，单位 KB。传入 frameSize 后，每录制指定帧大小的内容后，会回调录制的文件内容，不指定则不会回调。暂仅支持 mp3 格式。
    }
    //开始录音
    recorderManager.start(options);

  },
  //停止录音并上传数据
  endRecord: function (e) {
    const self = this;
    //停止录音
    recorderManager.stop();
    //监听录音停止事件，执行上传录音文件函数
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)

      //返回值res.tempFilePath是录音文件的临时路径 (本地路径)    
      self.setData({
        tempFilePath: res.tempFilePath
      })
      innerAudioContext.src = res.tempFilePath
      //上传录音文件

      var uploadTask = wx.uploadFile({
        //没有method，自动为POST请求
        filePath: res.tempFilePath,
        name: 'file', //这个随便填
        url: util.baseUrl + '/newapi/api/chat/uploadimg', //填写自己服务器的地址。
        header: {
          "Content-Type": "multipart/form-data", //必须是这个格式
          Authorization: 'Bearer ' + wx.getStorageSync('token')
        },
        formData: {
          "toid": this.data.fromid,
          "fromid": wx.getStorageSync('openid'),
          "typeid": 2,
          "brbm": "",
          leftright:1
        },
        success: (e) => {
          console.log('succeed!');
          console.log(e);
          this.getChatList(true)
        },
        fail: (e) => {
          console.log('failed!');
          console.log(e);
        }
      });
      uploadTask.onProgressUpdate((e) => {
        console.log(e);
        console.log('期望上传的总字节数：' + e.totalBytesExpectedToSend);
        console.log('已经上传的字节数' + e.totalBytesSent);
      })
    })
  },
  playAudio(e) {
    console.log(e)
    innerAudioContext.src = 'https://wx.pmc-wz.com/hyb/ximages/' + e.currentTarget.dataset.audiopath;
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onEnded((res) => {
      console.log("播放完成")
    })
    innerAudioContext.play();
  }
})