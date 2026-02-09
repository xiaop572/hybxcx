const {
    req
} = require('../../utils/request')
const util = require('../../utils/util');


Page({
    data: {
        name: '',
        country: '',
        phone: '',
        code: '',
        name1: '',
        code1: '',
        name2: '',
        code2: '',
        pwd:'',
        cardno:""
    },

    onLoad: function (options) {
        // 页面加载时执行
        if(options.param){
            const save=JSON.parse(options.param)
            this.setData({
                pwd:save.jhm
            })
        }

        req({
            url: `${util.baseUrl}/newapi/api/card/checkHasAccount`,
            method: "GET",
            data: {
                openid: wx.getStorageSync('openid')
            },
            success: (res) => {
                if (res.data.status==false) {
                    wx.showToast({
                        title: '请填写信息',
                    })
                    return
                    
                } else {
                    wx.showToast({
                        title: '用户为会员',
                    })
                    wx.redirectTo({
                        url: '../qyzx/qyzx',
                        success: function (res) {
                            console.log('跳转成功');
                        },
                        fail: function (err) {
                            console.error('跳转失败:', err);
                        }
                    });
                }
            }
        })
    },


    // 确认开卡按钮点击事件
    submitForm() {
        if (!this.data.name || !this.data.country || !this.data.phone || !this.data.code) {
            wx.showToast({
                title: '请填写必要信息',
                icon: 'none'
            });
            return;
        }
        wx.showLoading({
            title: '提交中',
        });
        req({
            url: `${util.baseUrl}/newapi/api/card/activateAccount`,
            method: "POST",
            data: {
                openid: wx.getStorageSync('openid'),
                cardpwd: this.data.pwd,
                name: this.data.name,
                code: this.data.code,
                phone: this.data.phone,
                country: this.data.country,
                family1: this.data.name1,
                family2: this.data.name2,
                family1code: this.data.code1,
                family2code: this.data.code2,
                cardno:this.data.cardno
            },
            
            success: (res) => {
                console.log('res', res)
                if (res.data.status==true) {
                    wx.showToast({
                        title: '正在注册激活',
                    })
                    wx.redirectTo({
                        url: '/subpackagesDDD/tjqw/tjqw',
                        success: function (res) {
                            console.log('跳转成功');
                        },
                        fail: function (err) {
                            console.error('跳转失败:', err);
                        }
                    });
                } else {
                    wx.showToast({
                        title: '此券已领取',
                    })
                }
            }
        })

        // 这里添加表单提交逻辑
        setTimeout(() => {
            // wx.hideLoading();
            wx.showToast({
                title: '注册激活成功',
                icon: 'success'
            });
        }, 1500);
        
    }
})