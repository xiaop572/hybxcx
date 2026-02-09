Page({
  data: {
    showCard: false
  },

  onLoad: function() {
    wx.showLoading({
      title: '准备中...',
      mask: true
    });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showCard: true }, () => {
        this.initCanvas();
      });
    }, 1500);
  },

  timer: null,

  onUnload: function() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
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
});