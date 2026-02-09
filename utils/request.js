function req(obj) {
  wx.request({
    ...obj,
    header: {
      Authorization: 'Bearer ' + wx.getStorageSync('token')
    },
    success: function (res) {
      if (res.data.code == 14007) {
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
      } else {
        obj.success && obj.success(res)
      }
    }
  })
}
module.exports = {
  req
}