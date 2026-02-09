const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({
  data: {
    messages: [],
    inputValue: '',
    scrollIntoView: '',
    nextId: 1
  },

  onLoad() {
    // 显示免责声明弹框
    wx.showModal({
      title: '免责声明',
      content: 'AI解读结果仅供参考，不能替代医生的专业判断和临床经验。',
      showCancel: false,
      confirmText: '我已知晓',
      success: (res) => {
        if (res.confirm) {
          // 初始化欢迎消息
          this.addMessage({
            type: 'ai',
            content: '您好，我是慧医宝智能助手小和，可以为您解答医疗健康相关问题，请问有什么可以帮您？',
            messageType: 'text'
          });
        }
      }
    });
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content) return;

    // 添加用户消息
    this.addMessage({
      type: 'user',
      content: content,
      messageType: 'text'
    });

    // 清空输入框
    this.setData({
      inputValue: ''
    });

    // 添加AI思考状态消息
    const thinkingId = this.data.nextId;
    this.addMessage({
      type: 'ai',
      content: '思考中...',
      messageType: 'thinking'
    });

    // 发送请求获取AI回复
    req({
      url: util.baseUrl + "/newapi/api/Volc/generateTextResponse",
      method: "POST",
      data: {
        Question: content
      },
      success: res => {
        // 更新思考状态消息为实际回复
        const messages = this.data.messages.map(msg => {
          if (msg.id === thinkingId) {
            return {
              ...msg,
              content: res.data.data.Response || '抱歉，我没有理解您的问题',
              messageType: 'text'
            };
          }
          return msg;
        });

        this.setData({
          messages
        }, () => {
          // 使用nextTick确保DOM更新后再触发滚动
          wx.nextTick(() => {
            // 延迟滚动以确保disclaimer-text区域也被包含在内
            setTimeout(() => {
              this.setData({
                scrollIntoView: `msg-${thinkingId}`,
                'scroll-animation-duration': 1500
              });
            }, 100);
          });
        });

        // 添加cell组件消息
        const cellId = this.data.nextId;
        this.addMessage({
          type: 'ai',
          content: '',
          messageType: 'cell'
        }, () => {
          // 使用nextTick确保cell组件加载完成后再滚动
          setTimeout(() => {
            wx.nextTick(() => {
              // 延迟滚动以确保disclaimer-text区域也被包含在内
              setTimeout(() => {
                this.setData({
                  scrollIntoView: `msg-${cellId}`,
                  'scroll-animation-duration': 2000
                });
              }, 100);
            });
          }, 500);
        });
      },
      fail: () => {
        // 请求失败时更新思考状态消息
        const messages = this.data.messages.map(msg => {
          if (msg.id === thinkingId) {
            return {
              ...msg,
              content: '抱歉，服务出现了点问题，请稍后再试',
              messageType: 'text'
            };
          }
          return msg;
        });

        this.setData({
          messages
        });
      }
    });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 获取文件扩展名
        const extName = tempFilePath.substring(tempFilePath.lastIndexOf('.') + 1).toLowerCase();
        // 根据扩展名设置MIME类型
        let mimeType = 'image/jpeg';
        if (extName === 'png') {
          mimeType = 'image/png';
        } else if (extName === 'gif') {
          mimeType = 'image/gif';
        } else if (extName === 'webp') {
          mimeType = 'image/webp';
        }
        
        // 读取图片文件并转换为base64
        const fileManager = wx.getFileSystemManager();
        const base64Data = fileManager.readFileSync(tempFilePath, 'base64');
        // 添加base64标头
        const base64Image = `data:${mimeType};base64,${base64Data}`;
        
        // 发送图片消息
        this.addMessage({
          type: 'user',
          content: base64Image,
          messageType: 'image'
        });

        // 添加AI思考状态消息
        const thinkingId = this.data.nextId;
        this.addMessage({
          type: 'ai',
          content: '思考中...',
          messageType: 'thinking'
        });

        // 发送base64图片数据
        req({
          url: util.baseUrl + "/newapi/api/Volc/generateImageResponse",
          method: 'POST',
          data: {
            base64: base64Image,
            Question: "帮我分析一下这张照片"
          },
          success: (uploadRes) => {
            const res = uploadRes.data.data;
            // 更新思考状态消息为实际回复
            const messages = this.data.messages.map(msg => {
              if (msg.id === thinkingId) {
                return {
                  ...msg,
                  content: res.Response || '抱歉，我无法解读这张图片',
                  messageType: 'text'
                };
              }
              return msg;
            });
            
            this.setData({
              messages
            }, () => {
              // 使用nextTick确保DOM更新后再触发滚动
              wx.nextTick(() => {
                this.setData({
                  scrollIntoView: `msg-${thinkingId}`,
                  'scroll-animation-duration': 2000
                });
              });
            });

            // 添加cell组件消息
            this.addMessage({
              type: 'ai',
              content: '',
              messageType: 'cell'
            });
          },
          fail: () => {
            // 请求失败时更新思考状态消息
            const messages = this.data.messages.map(msg => {
              if (msg.id === thinkingId) {
                return {
                  ...msg,
                  content: '抱歉，服务出现了点问题，请稍后再试',
                  messageType: 'text'
                };
              }
              return msg;
            });

            this.setData({
              messages
            }, () => {
              // 使用nextTick确保DOM更新后再触发滚动
              wx.nextTick(() => {
                this.setData({
                  scrollIntoView: `msg-${thinkingId}`,
              'scroll-animation-duration': 1000 // 设置滚动动画时长为1000ms
                });
              });
            });
          }
        });
      }
    });
  },

  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    console.log(src)
    wx.previewImage({
      current: src,
      urls: [src]
    });
  },

  startmessage() {
    console.log('开始播放语音');
  },

  completemessage() {
    console.log('语音播放完成');
  },

  addMessage(messageData) {
    const id = this.data.nextId;
    const message = {
      id: id,
      type: messageData.type,
      content: messageData.content,
      messageType: messageData.messageType
    };

    this.setData({
      messages: [...this.data.messages, message],
      nextId: id + 1
    }, () => {
      wx.nextTick(() => {
        const query = wx.createSelectorQuery().in(this);
        query.select('.message-list').boundingClientRect(rect => {
          if (rect) {
            // 获取消息列表的实际高度
            const scrollHeight = rect.height;
            
            // 使用nextTick确保DOM更新后再设置滚动
            wx.nextTick(() => {
              this.setData({
                scrollIntoView: `msg-${id}`,
                'scroll-animation-duration': 1500 // 增加动画时长使滚动更平滑
              });
            });
          }
        }).exec();
      });
    });
  }
});