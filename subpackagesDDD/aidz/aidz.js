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
        isme: false,
        noneStatus:false
    },

    onLoad: async function (options) {
        try{

        }catch{
            console.error('出现错误:', error);
        }
        
            
    },

    onInputChange: function (e) {},

    sendMessage: function () {

        if (this.data.inputMessage.trim()) {
            this.setData({
                noneStatus:true
            })
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
            url: util.baseUrl + "/newapi/api/Volc/daozhenRequest",
            method: "POST",
            data: {
                Question: this.data.messages[tokingLength - 1].Response,
                openid:wx.getStorageSync('openid')
            },
            success: (res) => {
                // this.data.messages.push(res.data.data)

                this.setData({
                    messages: this.data.messages.concat(res.data.data),
                    inputMessage: '',
                    isme: false,
                    noneStatus:false
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