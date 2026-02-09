const {
    req
} = require('../../utils/request')
const util = require('../../utils/util');


Page({
    data: {
        inputMessage: '',
        messages: [],
        scrollToView: 'message-bottom',
        keyboardHeight: 0,
        brbm: '',
        chatId: '',
        isme: false
    },

    onLoad: async function (options) {
        try{
            await this.getbrbm();
            await this.getChatId();
        }catch{
            console.error('出现错误:', error);
        }
        
            
    },

    getbrbm:function(){
        return new Promise((resolve, reject) => {
            req({
                url: util.baseUrl + "/newapi/api/brda/bindmylist",
                method: "POST",
                data: {
                    openid: wx.getStorageSync('openid')
                },
                success: (res) => {
                    this.setData({
                        brbm: this.data.brbm.concat(res.data.data[0].brbm)
                    })
                    resolve();
                },
                fail: function (err) {
                    reject(err);
                }
            })
        });
        
    },

    getChatId: function () {
        return new Promise((resolve, reject) => {
            req({
                url: util.baseUrl + "/newapi/api/Volc/startZhenqianChat",
                method: "POST",
                data: {
                    Brbm: this.data.brbm
                },
                success: (res) => {
                    this.setData({
                        chatId: res.data.data
                    })
                    console.log('chatid', this.data.chatId)
                    resolve();
                },
                fail: function (err) {
                    reject(err);
                }
            })
        });
        
    },

    onInputChange: function (e) {},

    sendMessage: function () {
        if (this.data.inputMessage.trim()) {
            this.setData({
                messages: this.data.messages.concat({
                    Response: this.data.inputMessage,
                    isme: true
                }),
                inputMessage: '',
            })
        } else {
            return
        }
        const tokingLength = this.data.messages.length
        req({
            url: util.baseUrl + "/newapi/api/Volc/sendZhenqianText",
            method: "POST",
            data: {
                Text: this.data.messages[tokingLength - 1].Response,
                // Text:this.data.inputMessage,
                ChatId: this.data.chatId
            },
            success: (res) => {
                // this.data.messages.push(res.data.data)

                this.setData({
                    messages: this.data.messages.concat(res.data.data),
                    inputMessage: '',
                    isme: false
                })
                this.scrollToBottom();
            }
        })

        // 滚动到底部
        this.scrollToBottom();
    },

    // 滚动到底部
    scrollToBottom: function () {
        this.setData({
            scrollToView: 'message-bottom'
        });
    }
})