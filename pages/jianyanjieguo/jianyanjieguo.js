// subpackages/jianyanjieguo/jianyanjieguo.js
const {
    req
} = require('../../utils/request');
const util = require('../../utils/util');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        aifxstatus: false,
        aifxtext: '',
        getinfo:{},
        aifxtextStatus:false,
        noneStatus:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options)
        this.setData({
            getinfo:options
        })
        req({
            url: util.baseUrl + "/newapi/api/brda/getlisdetail",
            method: "POST",
            data: {
                "sampleda": options.sampleda,
                "instrid": options.instrid,
                "sampleno": options.sampleno,
                "openid": wx.getStorageSync('openid')
            },
            success: (res) => {
                this.setData({
                    list: res.data.data
                })
            }
        })
    },

    aifx() {
        wx.showLoading({
            title: 'AI分析中...',
        })
        req({
            url: util.baseUrl + "/newapi/api/Volc/lisReportAnalyze",
            method: "post",
            data: {
                sampleda: this.data.getinfo.sampleda,
                instrid: this.data.getinfo.instrid,
                sampleno: this.data.getinfo.sampleno,
                openid: wx.getStorageSync('openid'),
                brbm: this.data.getinfo.brbm
            },
            success: (res) => {
                const apiData = res.data.data
                let formattedData = apiData;
                if (typeof apiData !== 'string') {
                    try {
                        formattedData = JSON.stringify(apiData, null, 2);
                    } catch (e) {
                        formattedData = String(apiData);
                    }
                }
                
                // 过滤掉#和*字符
                formattedData = formattedData.replace(/[#*]/g, '')
                
                // 跳转到AI分析结果页面
                wx.navigateTo({
                    url: '/subpackagesC/aifx/aifx?aifxtext=' + encodeURIComponent(formattedData) + 
                         '&name=' + encodeURIComponent(this.data.getinfo.brxm || this.data.getinfo.name || '') + 
                         '&serialno=' + encodeURIComponent(this.data.getinfo.sampleno || '') + 
                         '&myDate=' + encodeURIComponent(this.data.getinfo.sampleda || ''),
                    complete: () => {
                        wx.hideLoading();
                    }
                })
            },
            fail: () => {
                wx.hideLoading();
                wx.showToast({
                    title: '分析失败，请重试',
                    icon: 'none'
                })
            }
        })
    },
    processApiData(data) {
        // 确保数据是字符串格式，便于显示Markdown内容
        let formattedData = data;
        if (typeof data !== 'string') {
            try {
                formattedData = JSON.stringify(data, null, 2);
            } catch (e) {
                formattedData = String(data);
            }
        }
        formattedData = formattedData.replace(/[#*]/g, '')
        this.setData({
            aifxtextStatus: true,
            aifxtext: formattedData
        });
    },
    closeaifx() {
        this.setData({
            aifxstatus: false,
            aifxtextStatus:false,
            noneStatus:false
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