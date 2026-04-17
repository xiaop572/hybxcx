// subpageC/diagnosis/diagnosis.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

Page({
  data: {
    imageUrl: '', // 上传的图片地址
    imageBase64: '', // 图片的base64编码
    message: '', // 用户输入的消息
    messageList: [], // 消息列表
    showWelcome: true, // 是否显示欢迎页
    isAiTyping: false, // AI是否正在输入
    isFirstImageUpload: true, // 是否是第一次上传图片
    showGiftModal: false, // 是否显示见面礼弹窗
    showRealNameModal: false, // 是否显示实名弹窗
    realName: '', // 实名姓名
    realPhone: '', // 实名手机号
    privacyAgreed: false, // 隐私协议是否同意
  },

  onLoad(options) {
    // 检查是否实名
    this.checkRealName();
  },
  rmzxj(){
    wx.navigateTo({
      url: '/subpackagesC/cefuzhifengmian/cefuzhifengmian',
    })
  },
  // 检查实名状态
  checkRealName() {
    const realInfo = wx.getStorageSync('realInfo');
    if (!realInfo || !realInfo.realname || !realInfo.mobile) {
      // 未实名，显示实名弹窗
      this.setData({
        showRealNameModal: true,
        realName: realInfo?.realname || '',
        realPhone: realInfo?.mobile || '',
        privacyAgreed: !!(realInfo?.realname || realInfo?.mobile)
      });
    }
  },

  // 选择图片上传
  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];

        // 将图片转换为base64
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: (fileRes) => {
            that.setData({
              imageUrl: tempFilePath,
              imageBase64: fileRes.data
            });

            // 发送图片消息
            that.sendImageMessage(fileRes.data);
          },
          fail: (err) => {
            console.error('读取图片失败', err);
            wx.showToast({
              title: '图片读取失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 发送图片消息
  sendImageMessage(base64Data) {
    const openid = wx.getStorageSync('openid');

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 添加用户图片消息到列表
    this.addUserMessage('[图片]', 'image', this.data.imageUrl);

    // 显示AI加载状态
    this.showAiLoading();

    // 调用流式接口
    this.streamRequest(base64Data, openid);
  },

  // 流式请求处理
  streamRequest(base64Data, openid) {
    const that = this;
    let streamedText = '';
    let aiMessageIndex = -1;
    let lastUpdateTime = 0; // 上次更新的时间戳
    const UPDATE_INTERVAL = 30; // 30毫秒更新一次，实现更流畅的实时效果

    const requestTask = wx.request({
      url: util.baseUrl + '/newapi/api/Volc/stream',
      method: 'POST',
      enableChunked: true, // 启用分块传输
      data: {
        Question: '',
        base64: base64Data,
        openid: openid
      },
      success: (res) => {
        console.log('【流式完成】总长度:', streamedText.length);

        // 最后一次完整更新
        if (aiMessageIndex >= 0) {
          const messageList = [...that.data.messageList];

          // 生成最终的 messageParts
          let messageParts = [{
            type: 'text',
            content: that.formatMessageContent(streamedText)
          }];

          // 如果是第一次上传图片，添加见面礼文案
          if (that.data.isFirstImageUpload) {
            // const giftText = '\n#点击领取小慧的见面礼（单部位冰点脱毛1次或医用面膜1片）';
            const giftText = '\n#点击领取【光子嫩肤】邂逅光感美肌';
            streamedText += giftText;

            messageParts = [{
                type: 'text',
                content: that.formatMessageContent(streamedText.replace(giftText, ''))
              },
              {
                type: 'gift-link',
                content: giftText
              }
            ];

            messageList[aiMessageIndex].hasGiftLink = true;
          }

          messageList[aiMessageIndex].content = streamedText;
          messageList[aiMessageIndex].messageParts = messageParts;

          console.log('【最终更新】长度:', streamedText.length);

          that.setData({
            messageList: messageList,
            isAiTyping: false,
            isFirstImageUpload: false
          });
        } else {
          that.setData({
            isAiTyping: false
          });
        }

        that.scrollToBottom();
      },
      fail: (err) => {
        console.error('图片分析失败', err);
        this.setData({
          isAiTyping: false
        });
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'none'
        });
      }
    });

    // 监听分块数据
    requestTask.onChunkReceived((res) => {
      try {
        const arrayBuffer = res.data;

        // 兼容性处理：使用自定义的 UTF-8 解码
        let chunk = '';
        const uint8Array = new Uint8Array(arrayBuffer);

        // 将 ArrayBuffer 转换为字符串（支持中文）
        let i = 0;
        while (i < uint8Array.length) {
          const byte1 = uint8Array[i++];

          if (byte1 < 0x80) {
            // 单字节字符 (ASCII)
            chunk += String.fromCharCode(byte1);
          } else if (byte1 < 0xE0) {
            // 双字节字符
            const byte2 = uint8Array[i++];
            chunk += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
          } else if (byte1 < 0xF0) {
            // 三字节字符 (中文等)
            const byte2 = uint8Array[i++];
            const byte3 = uint8Array[i++];
            chunk += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
          } else {
            // 四字节字符
            const byte2 = uint8Array[i++];
            const byte3 = uint8Array[i++];
            const byte4 = uint8Array[i++];
            const codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
            chunk += String.fromCharCode(0xD800 + ((codePoint - 0x10000) >> 10), 0xDC00 + ((codePoint - 0x10000) & 0x3FF));
          }
        }

        console.log('==== 接收到数据块 ====');
        console.log('原始数据:', chunk);

        // 解析 SSE 格式数据 (data: "...")
        const lines = chunk.split('\n');
        for (let line of lines) {
          if (line.startsWith('data: ')) {
            // 提取 data: 后面的内容
            let content = line.substring(6).trim();

            console.log('提取的内容:', content);

            // 跳过结束标记
            if (content === '[DONE]' || content === '') {
              console.log('跳过结束标记或空内容');
              continue;
            }

            // 尝试解析为 JSON 字符串（去掉引号并解码 Unicode）
            try {
              if (content.startsWith('"') && content.endsWith('"')) {
                content = JSON.parse(content);
                console.log('解析后的内容:', content);
              }
            } catch (e) {
              console.log('JSON 解析失败，使用原内容');
            }

            // 累加文本
            streamedText += content;

            // 判断是否需要更新UI
            const now = Date.now();
            const isFirstMessage = aiMessageIndex === -1;
            const isTimeToUpdate = (now - lastUpdateTime >= UPDATE_INTERVAL);

            // 第一条消息立即显示，后续消息按时间间隔更新
            if (isFirstMessage || isTimeToUpdate) {
              lastUpdateTime = now;

              console.log('【更新页面】长度:', streamedText.length, '内容:', streamedText.substring(streamedText.length - 10));

              // 生成 messageParts
              const messageParts = [{
                type: 'text',
                content: that.formatMessageContent(streamedText)
              }];

              if (isFirstMessage) {
                // 第一次创建消息 - 立即显示，关闭加载状态
                const messageList = [...that.data.messageList];
                messageList.push({
                  type: 'ai',
                  msgType: 'text',
                  content: streamedText,
                  messageParts: messageParts,
                  time: new Date().getTime()
                });
                aiMessageIndex = messageList.length - 1;

                console.log('【✅ 第一条消息立即显示】索引:', aiMessageIndex, '内容:', streamedText);

                that.setData({
                  messageList: messageList,
                  isAiTyping: false, // 关闭加载状态
                  showWelcome: false
                }, () => {
                  // 更新完成后滚动到底部
                  that.scrollToBottom();
                });
              } else {
                // 更新现有消息
                that.setData({
                  [`messageList[${aiMessageIndex}].content`]: streamedText,
                  [`messageList[${aiMessageIndex}].messageParts`]: messageParts
                }, () => {
                  // 更新完成后滚动到底部
                  that.scrollToBottom();
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('处理数据块失败:', err, err.stack);
      }
    });
  },

  // 按钮1 - 关于小慧
  handleButton1() {
    const userMsg = '关于小慧|你的AI变美搭子';
    const aiReply = '嗨！我是你的AI变美搭子小慧。我的使命，就是做你一面"科学的镜子"，帮你更温柔、客观地看清自己独特的美~\n我们可以先随便聊聊你的小困扰，或者马上进行一个AI面诊，生成一份专属于你的初阶美学评估报告。\n这份报告会像一位懂你的朋友，帮你分析：\n△ 轮廓线条是否流畅和谐？\n△ 五官（眼、鼻…）有哪些亮点和可以更精致的地方？\n△ 基于你的特点，有哪些清晰的优化思路？\n\n想试试吗？你只需要发我一张清晰的正面素颜照，我就能为你生成这份专属报告。这会是帮你理清思路、与专家高效沟通的绝佳起点哦~\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮2 - 点亮「心灵之窗」
  handleButton2() {
    const userMsg = '点亮「心灵之窗」';
    const aiReply = '都说眼睛是心灵的窗户。如果觉得眼睛不够有神、显疲态，可能是双眼皮形态、眼皮松弛或者内眼角的一点影响。发我一张你的眼部正面照片吧，我可以先帮你看看可能的原因，然后我们聊聊双眼皮、开眼角等不同方式能带来怎样的改变。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮3 - 重塑「面中之王」
  handleButton3() {
    const userMsg = '重塑「面中之王」';
    const aiReply = '鼻子是面部的核心，调整的关键是让它和你的整体脸型搭配和谐，而不是单纯变高。你更喜欢自然直鼻还是微翘水滴鼻的风格？发我一张你的正面和侧面脸部照片，我可以帮你分析鼻梁高度、鼻尖形状等，然后聊聊注射、假体或复合隆鼻这些选择分别适合什么情况。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮4 - 雕琢「身体曲线」
  handleButton4() {
    const userMsg = '雕琢「身体曲线」';
    const aiReply = '胸部之美，在于形态、大小和身体曲线的和谐。无论是想改善大小、形态，还是应对产后变化，我们都可以先聊聊。你更追求饱满挺拔的曲线，还是自然圆润的感觉？发我一张你的上半身照片（穿紧身衣即可），我可以先帮你做个初步的体型与比例分析，然后我们再一起了解假体、自体脂肪等不同方式的区别。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮5 - 打造「上镜轮廓」
  handleButton5() {
    const userMsg = '打造「上镜轮廓」';
    const aiReply = '流畅的脸部线条会让整体感觉更上镜。这通常和下颌线、颧骨的线条以及面部软组织的比例有关。你更希望让轮廓更柔和、更紧致，还是增加饱满度？发我一张你的正面脸部照片，我可以帮你标记关键位置，然后我们聊聊瘦脸针、吸脂或填充等不同的改善思路。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 快速发送消息（固定回复，不请求接口）
  quickSendMessage(userMsg, aiReply) {
    // 添加用户消息
    this.addUserMessage(userMsg);

    // 显示AI加载状态
    this.showAiLoading();

    // 延迟显示AI回复（模拟思考时间）
    setTimeout(() => {
      this.addAiMessage(aiReply);
    }, 1000);
  },

  // 输入消息
  handleMessageInput(e) {
    this.setData({
      message: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    if (!this.data.message.trim()) {
      wx.showToast({
        title: '请输入消息',
        icon: 'none'
      });
      return;
    }

    const msg = this.data.message;

    // 清空输入框
    this.setData({
      message: ''
    });

    // 发送文本消息
    this.sendTextMessage(msg);
  },

  // 发送文本消息
  sendTextMessage(text) {
    const openid = wx.getStorageSync('openid');

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 添加用户消息到列表
    this.addUserMessage(text);

    // 显示AI加载状态
    this.showAiLoading();

    // 调用接口
    req({
      url: util.baseUrl + '/aiapi/api/Volc/generateImageResponse',
      method: 'POST',
      data: {
        Question: text,
        base64: '',
        openid: openid
      },
      success: (res) => {
        console.log('消息发送成功', res);
        console.log('完整返回数据:', JSON.stringify(res.data));

        // 优先使用 Response 字段（不检查 status）
        if (res.data && res.data.data && res.data.data.Response) {
          console.log('使用 Response 字段:', res.data.data.Response);
          this.addAiMessage(res.data.data.Response);
        } else if (res.data && res.data.msg) {
          console.log('使用 msg 字段:', res.data.msg);
          this.addAiMessage(res.data.msg);
        } else {
          console.log('使用默认消息');
          this.addAiMessage('收到您的消息');
        }
      },
      fail: (err) => {
        console.error('消息发送失败', err);
        this.setData({
          isAiTyping: false
        });
        wx.showToast({
          title: '发送失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 添加用户消息
  addUserMessage(content, msgType = 'text', imageUrl = '') {
    const newMessage = {
      type: 'user',
      msgType: msgType,
      content: content,
      imageUrl: imageUrl,
      time: new Date().getTime()
    };

    this.setData({
      messageList: [...this.data.messageList, newMessage],
      showWelcome: false
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  // 添加AI消息
  addAiMessage(content) {
    // 检查是否包含"点击领取"
    const hasGiftLink = content.includes('#点击领取小慧的见面礼');

    // 如果包含见面礼链接，拆分消息
    let messageParts = [];
    if (hasGiftLink) {
      // 查找见面礼文字
      const giftRegex = /(#点击领取小慧的见面礼[^\n#]*)/;
      const match = content.match(giftRegex);

      if (match) {
        const giftText = match[1];
        const parts = content.split(giftText);

        // 前半部分
        if (parts[0]) {
          messageParts.push({
            type: 'text',
            content: this.formatMessageContent(parts[0])
          });
        }

        // 见面礼链接部分
        messageParts.push({
          type: 'gift-link',
          content: giftText
        });

        // 后半部分
        if (parts[1]) {
          messageParts.push({
            type: 'text',
            content: this.formatMessageContent(parts[1])
          });
        }
      }
    } else {
      // 没有见面礼链接，正常格式化
      messageParts.push({
        type: 'text',
        content: this.formatMessageContent(content)
      });
    }

    const newMessage = {
      type: 'ai',
      content: content,
      hasGiftLink: hasGiftLink,
      messageParts: messageParts,
      time: new Date().getTime()
    };

    this.setData({
      messageList: [...this.data.messageList, newMessage],
      isAiTyping: false
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  // 格式化消息内容（处理#标签和换行）
  formatMessageContent(text) {
    let formatted = text;

    // 处理 # 标签
    formatted = formatted.replace(
      /(#[^#\n]+)/g,
      '<span style="color: #4A90E2; font-weight: 500;">$1</span>'
    );

    // 将换行符转换为 <br/>
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
  },

  // 显示AI加载状态
  showAiLoading() {
    this.setData({
      isAiTyping: true
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  // 滚动到底部
  scrollToBottom() {
    // 使用 nextTick 确保数据渲染完成后再滚动
    wx.nextTick(() => {
      // 直接滚动到一个足够大的值，确保到达底部
      wx.pageScrollTo({
        scrollTop: 999999,
        duration: 100 // 缩短动画时间，使滚动更快速流畅
      });
    });
  },

  // 显示见面礼弹窗
  showGiftModal() {
    this.setData({
      showGiftModal: true
    });
  },

  // 隐藏见面礼弹窗
  hideGiftModal() {
    this.setData({
      showGiftModal: false
    });
  },

  // 点击见面礼链接
  handleGiftLinkTap() {
    // 检查是否已实名
    const realInfo = wx.getStorageSync('realInfo');
    if (!realInfo || !realInfo.realname || !realInfo.mobile) {
      wx.showToast({
        title: '请先完成实名验证',
        icon: 'none'
      });
      this.setData({
        showRealNameModal: true
      });
      return;
    }

    // 已实名，直接领取礼品
    this.claimGift(realInfo.mobile);
    // wx.navigateTo({
    //   url: '/huodongpage/lfk/lfk?cardid=7',
    // })
  },

  // 领取礼品
  claimGift(phone) {
    wx.showLoading({
      title: '领取中...',
      mask: true
    });

    // 直接调用赠送接口
    this.giveFreeZheBa(phone);
  },

  // 复制消息内容
  copyMessage(e) {
    const content = e.currentTarget.dataset.content;
    if (!content) {
      return;
    }

    // 去掉HTML标签，获取纯文本
    const plainText = content.replace(/<[^>]+>/g, '').replace(/<br\/>/g, '\n');

    wx.setClipboardData({
      data: plainText,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // 输入姓名
  handleNameInput(e) {
    this.setData({
      realName: e.detail.value
    });
  },

  // 输入手机号
  handlePhoneInput(e) {
    this.setData({
      realPhone: e.detail.value
    });
  },

  // 隐私协议勾选状态变化
  onPrivacyChange(e) {
    const values = e.detail.value;
    this.setData({
      privacyAgreed: values.includes('agree')
    });
  },

  // 实名弹窗 - 一键获取手机号
  getRealPhoneNumber(e) {
    console.log('实名获取手机号回调', e);

    if (e.detail.iv && e.detail.encryptedData) {
      const openid = wx.getStorageSync('openid');

      wx.showLoading({
        title: '获取中...',
        mask: true
      });

      req({
        url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: openid,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: (res) => {
          wx.hideLoading();
          console.log('获取手机号成功', res);

          this.setData({
            realPhone: res.data
          });
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('获取手机号失败', err);
          wx.showToast({
            title: '获取失败，请重试',
            icon: 'none'
          });
        }
      });
    } else {
      console.log('用户取消授权');
    }
  },

  // 提交实名信息
  submitRealName() {
    const {
      realName,
      realPhone,
      privacyAgreed
    } = this.data;

    if (!realName) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    if (!realPhone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(realPhone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    const openid = wx.getStorageSync('openid');


    // 第一步：设置手机号
    req({
      url: util.baseUrl + '/newapi/api/WechatUser/setmobile',
      method: 'POST',
      data: {
        openid: openid,
        mobile: realPhone
      },
      success: () => {
        // 第二步：设置实名信息
        req({
          url: util.baseUrl + '/newapi/api/WechatUser/setrealnamecard',
          method: 'POST',
          data: {
            openid: openid,
            realname: realName,
            cardno: '' // 身份证号选填，这里为空
          },
          success: () => {
            // 第三步：获取用户信息并保存
            req({
              url: util.baseUrl + '/newapi/api/WechatUser/getuserinfo',
              data: {
                openid: openid
              },
              success: (res) => {

                if (res.data && res.data.data) {
                  // 保存实名信息到本地
                  wx.setStorageSync('realInfo', {
                    ...wx.getStorageSync('realInfo'),
                    ...res.data.data
                  });
                }

                // 关闭弹窗
                this.setData({
                  showRealNameModal: false
                });

                wx.showToast({
                  title: '实名成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                console.error('获取用户信息失败', err);
                wx.showToast({
                  title: '实名失败，请重试',
                  icon: 'none'
                });
              }
            });
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('设置实名信息失败', err);
            wx.showToast({
              title: '实名失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('设置手机号失败', err);
        wx.showToast({
          title: '实名失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 获取手机号（领取见面礼用）
  getPhoneNumber(e) {
    console.log('获取手机号回调', e);

    if (e.detail.iv && e.detail.encryptedData) {
      wx.showLoading({
        title: '处理中...',
        mask: true
      });

      // 第一步：解密手机号
      req({
        url: util.baseUrl + '/aiapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: (res) => {
          console.log('解密手机号成功', res.data);

          if (res.data && res.data.data) {
            // 第二步：调用赠送接口
            this.giveFreeZheBa(res.data.data);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '获取手机号失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('解密手机号失败', err);
          wx.hideLoading();
          wx.showToast({
            title: '获取手机号失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 用户拒绝授权
      console.log('用户拒绝授权手机号');
    }
  },

  // 调用赠送折扣接口
  giveFreeZheBa(phone) {
    const openid = wx.getStorageSync('openid');

    req({
      url: util.baseUrl + '/newapi/api/card/givefreezheba',
      method: 'POST',
      data: {
        openid: openid,
        phone: phone,
        money: 0,
        shareopenid: '',
        xinmin: ''
      },
      success: (res) => {
        console.log('赠送成功', res);
        wx.hideLoading();

        if (res.data && res.data.status) {
          // 成功
          wx.showModal({
            title: '领取成功',
            content: res.data.data || '恭喜您成功领取见面礼！',
            showCancel: false,
            complete: () => {
              // 跳转到我的卡券页面
              wx.navigateTo({
                url: '/subpackages/mycard/mycard'
              });
            }
          });
        } else {
          // 失败
          wx.showModal({
            title: '提示',
            content: res.data.msg || res.data.data || '领取失败，请稍后重试',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('赠送失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '领取失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI面诊 - 让小慧为你量身定制变美计划',
      path: 'subpackagesC/diagnosis/diagnosis'
    };
  }
});