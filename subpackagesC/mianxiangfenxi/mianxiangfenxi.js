// subpackagesC/mianzhenxiangji/mianzhenxiangji.js
Page({

  data: {
    tipsText: '请将脸部对准框内',
    isFaceValid: false,
    faceFrameUrl: '',
    cameraPosition: 'front'
  },

  onLoad(options) {
    this.ctx = wx.createCameraContext();
    this.vkSession = null;
    this._sessionStarted = false;
    this._frameListener = null;
    this._lastDetectTime = 0;

    // 预计算 face-border 在相机画面中的归一化边界
    this._calcBorderBounds();
  },

  /**
   * 根据屏幕尺寸算出 face-border 的归一化坐标范围
   * face-border: 540rpx × 680rpx，居中于 camera 区域（camera 区高 = 屏高 - 底部面板360rpx）
   */
  _calcBorderBounds() {
    const sys = wx.getSystemInfoSync();
    const screenW = sys.windowWidth;   // px
    const screenH = sys.windowHeight;  // px
    const ratio   = screenW / 750;     // rpx → px

    const controlsH = 360 * ratio;          // 底部操作面板高度
    const cameraH   = screenH - controlsH;  // 相机显示区高度

    const bw = 540 * ratio;   // face-border 宽
    const bh = 680 * ratio;   // face-border 高

    const bLeft = (screenW - bw) / 2;
    const bTop  = (cameraH - bh) / 2;

    // 归一化（0~1）相对于各自轴的尺寸
    this._border = {
      left:   bLeft / screenW,
      right:  (bLeft + bw) / screenW,
      top:    bTop  / cameraH,
      bottom: (bTop  + bh) / cameraH
    };
    console.log('face-border bounds(normalized):', this._border);
  },

  /**
   * 相机就绪后启动 VKSession
   * 采用 mode:2（手动传帧）+ onCameraFrame 喂帧，避免与 <camera> 组件争用摄像头
   */
  onCameraInit(e) {
    console.log('相机初始化完成', e);
    if (this._sessionStarted) return;

    const sys = wx.getSystemInfoSync();
    if (sys.platform === 'devtools') {
      this.setData({ tipsText: '开发工具不支持实时检测，请真机测试' });
      return;
    }
    if (!wx.createVKSession) {
      this.setData({ tipsText: '当前微信版本不支持人脸检测（需 8.0.25+）' });
      return;
    }

    this.initVKSession();
  },

  /**
   * 初始化 VKSession — mode:2 手动传图（配合 onCameraFrame 喂帧）
   * mode:1 与 <camera> 组件同时使用时会争抢摄像头导致 updateAnchors 不触发
   */
  initVKSession() {
    const session = wx.createVKSession({
      track: {
        face: { mode: 2 }  // 2: 手动传入图像帧
      }
    });

    session.on('updateAnchors', anchors => {
      if (!anchors || anchors.length === 0) {
        this.updateTip('请将脸部对准框内', false);
        return;
      }
      this.checkFacePosition(anchors[0]);
    });

    session.on('removeAnchors', () => {
      this.updateTip('请将脸部对准框内', false);
    });

    session.on('error', err => {
      console.error('VKSession error', err);
    });

    session.start(errno => {
      if (errno) {
        console.error('VKSession start fail', errno);
        this.setData({ tipsText: '人脸检测启动失败: ' + errno });
      } else {
        this._sessionStarted = true;
        console.log('VKSession mode:2 已启动，开始喂帧');
        this.startFrameFeeding(session);
      }
    });

    this.vkSession = session;
  },

  /**
   * 用 onCameraFrame 持续取帧，每 300ms 调一次 detectFace
   * onCameraFrame 返回的 frame.data 是 RGBA 格式，对应 sourceType:1
   */
  startFrameFeeding(session) {
    const listener = this.ctx.onCameraFrame((frame) => {
      const now = Date.now();
      if (now - this._lastDetectTime < 300) return;
      this._lastDetectTime = now;

      session.detectFace({
        frameBuffer: frame.data,
        width: frame.width,
        height: frame.height,
        scoreThreshold: 0.5,
        sourceType: 1,
        modelMode: 1
      });
    });

    listener.start();
    this._frameListener = listener;
    console.log('onCameraFrame 监听已启动');
  },

  /**
   * 判断人脸是否在 face-border 框内
   * anchor.origin / anchor.size 已经是 0~1 归一化坐标，无需再除帧尺寸
   */
  checkFacePosition(anchor) {
    const { origin, size } = anchor;

    // 归一化人脸中心（anchor 值本身已是 0~1）
    const cx = origin.x + size.width  / 2;
    const cy = origin.y + size.height / 2;
    const nw = size.width;  // 人脸宽度占帧的比例

    const b = this._border || { left: 0.14, right: 0.86, top: 0.10, bottom: 0.90 };

    const isTooFar   = nw < 0.20;
    const isTooClose = nw > 0.78;
    // 人脸中心是否在 face-border 矩形范围内
    const inBox = cx > b.left && cx < b.right && cy > b.top && cy < b.bottom;

    let tip = '';
    let valid = false;

    if (isTooFar) {
      tip = '请靠近一点';
    } else if (isTooClose) {
      tip = '请离远一点';
    } else if (!inBox) {
      tip = '请将脸部移至框内中心';
    } else {
      tip = '位置合适，请保持不动 ✓';
      valid = true;
    }

    this.updateTip(tip, valid);
  },

  /**
   * 只在内容变化时 setData，避免频繁渲染
   */
  updateTip(tip, valid) {
    if (this.data.tipsText !== tip || this.data.isFaceValid !== valid) {
      this.setData({ tipsText: tip, isFaceValid: valid });
    }
  },

  /**
   * 拍照
   */
  switchCamera() {
    const pos = this.data.cameraPosition === 'front' ? 'back' : 'front';
    this.setData({ cameraPosition: pos });
    // 切换镜头后重置检测会话
    if (this._frameListener) {
      this._frameListener.stop();
      this._frameListener = null;
    }
    if (this.vkSession) {
      this.vkSession.stop();
      this.vkSession = null;
    }
    this._sessionStarted = false;
  },

  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        wx.showLoading({ title: '处理中...' })
        // 读取为 base64，存 storage 后跳转（base64 太长不适合放 URL 参数）
        wx.getFileSystemManager().readFile({
          filePath: res.tempImagePath,
          encoding: 'base64',
          success: fileRes => {
            wx.hideLoading()
            wx.setStorageSync('faceBase64', fileRes.data)
            wx.navigateTo({ url: '/subpackagesC/mxloading/mxloading' })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '图片处理失败', icon: 'none' })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '拍照失败', icon: 'none' })
      }
    })
  },

  /**
   * 从相册选择图片，读取 base64 后跳转加载页
   */
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempImagePath = res.tempFiles[0].tempFilePath
        wx.showLoading({ title: '处理中...' })
        wx.getFileSystemManager().readFile({
          filePath: tempImagePath,
          encoding: 'base64',
          success: fileRes => {
            wx.hideLoading()
            wx.setStorageSync('faceBase64', fileRes.data)
            wx.navigateTo({ url: '/subpackagesC/mxloading/mxloading' })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '图片读取失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        console.error('选择图片失败', err)
      }
    })
  },

  /**
   * 相机错误回调
   */
  error(e) {
    console.error('相机错误', e.detail);
    wx.showToast({
      title: '相机启动失败，请检查权限',
      icon: 'none'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this._frameListener) {
      this._frameListener.stop();
      this._frameListener = null;
    }
    if (this.vkSession) {
      this.vkSession.stop();
      this.vkSession = null;
    }
    this._sessionStarted = false;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
