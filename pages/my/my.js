//index.js
//获取应用实例
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const app = getApp()
const token = 'token'
var time = require('../../utils/util.js')
Page({
  data: {
    isLogin: false,
    userInfo: null,
    showModal: false,
    tabs: ["发表", "评论", "粉丝", "关注"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    publishList: [],
    commentList: [],
    fansList: [],
    focusList: [],
    page: 1
  },
  onLoad: function (options) {
    if (app.globalData.clear) {
      //退出登录的标志
      this.setData({
        userInfo: null
      })
    } else {
      var that = this;
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
            sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
          });
        }
      });
      wx.startPullDownRefresh({
      })
    }
  }
  ,
  onShow: function (e) {
    if (app.globalData.clear && this.data.userInfo != null) {
      this.setData({
        userInfo: null,
        isLogin: false,
        activeIndex: 0,
        publishList: [],
        commentList: [],
        fansList: [],
        focusList: []
      })
    } else if (!app.globalData.clear && this.data.userInfo == null) {
      this.getInfo()
    }
    if (app.conf.edit) {
      //修改过
      this.setData({
        activeIndex: 0,
        publishList: [],
        commentList: [],
        fansList: [],
        focusList: []
      })
      app.conf.edit = true
      this.getInfo()
    }
  },
  onReachBottom: function () {
    if (this.data.activeIndex == 1) {
      //评论
      this.getComment()

    }
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    if (wx.getStorageSync(token) == '') {
      wx.stopPullDownRefresh()
    } else {
      this.getInfo()
    }
  },
  login() {
    wx.navigateTo({
      url: '/pages/login/login?type=my'
    })
  },
  getInfo() {
    if (wx.getStorageSync(token) != '') {
      var that = this
      wx.request({
        url: app.conf.host + '/user/info',
        header: {
          'X-AUTH-TOKEN': wx.getStorageSync(token)
        },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          //var time = that.timeDefference(new Date(), res.data.data.CREATED)
          var time = Math.ceil((new Date().getTime() - new Date(res.data.data.CREATED).getTime()) / (1000 * 60 * 60 * 24))
          res.data.data.CREATED = time
          if(res.data.data.STATUE==1){
            res.data.data.IMG='../../img/bg_close.jpg'
          }
          that.setData({
            isLogin: true,
            userInfo: res.data.data
          })
          that.getArticle()
        },
        fail: function (res) { },
        complete: function (res) {
          wx.stopPullDownRefresh()
        },
      })
    }
  },
  // timeDefference: function (startTime, endTime) {
  //   var t1 = new Date(startTime)
  //   var t2 = new Date(endTime)
  //   console.log("start/1:" + t1.getMonth())
  //   console.log("start/1:" + t1.getHours())
  //   console.log("start/2:" + t2.getMonth())
  //   console.log("start/2:" + t2.getHours())
  //   if (t1.getFullYear() - t2.getFullYear() > 0) {
  //     var result = t1.getFullYear() - t2.getFullYear()
  //     return result + "年";
  //   }
  //   if (t1.getMonth() - t2.getMonth() > 0) {
  //     var result = t1.getMonth() - t2.getMonth();
  //     return result + "月";
  //   }
  //   if (t1.getDate() - t2.getDate() > 0) {
  //     var result = t1.getDate() - t2.getDate();
  //     return result + "天";
  //   }
  //   if (t1.getHours() - t2.getHours() > 0) {
  //     var result = t1.getHours() - t2.getHours();
  //     return result + "小时";
  //   }
  //   if (t1.getMinutes() - t2.getMinutes() > 0) {
  //     var result = t1.getMinutes() - t2.getMinutes();
  //     return result + "分钟";
  //   }
  //   return "刚刚"
  // },
  open: function () {
    var that = this
    var urls = []
    urls.push(that.data.userInfo.IMG)
    wx.previewImage({
      current: that.data.userInfo.IMG,
      urls: urls,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    var index = e.currentTarget.id
    if (index == 0) {
      //发表
      this.getArticle()
    } else if (index == 1) {
      //评论
      this.getComment()
    } else if (index == 2) {
      //粉丝
      this.getFans()
    } else {
      //关注
      this.getFocus()
    }
  },
  getComment() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/comment/?page=' + that.data.page,
      data: '',
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.length; i++) {
            var date = new Date(res.data.data[i].CREATED)
            res.data.data[i].CREATED = time.formatTime(date)
          }
          that.setData({
            commentList: that.data.commentList.concat(res.data.data)
          })
          if (res.data.data.length != 0) {
            that.setData({
              page: that.data.page + 1
            })
          }
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  getArticle() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/article/list',
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.length; i++) {
            var date = new Date(res.data.data[i].CREATED)
            res.data.data[i].CREATED = time.formatTime(date)
          }
          that.setData({
            publishList: res.data.data
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  getFans() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/user/fans',
      data: '',
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            fansList: res.data.data
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  getFocus: function (e) {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/user/focus/user',
      data: '',
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            focusList: res.data.data
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  toDetail: function (e) {
    var index = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + this.data.publishList[index].ID + "&i=0"
    })
  },
  toCommentDetail: function (e) {
    var index = parseInt(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + this.data.commentList[index].BELONG_ID + "&i=" + this.data.commentList[index].TYPE
    })
  },
  editInfo: function (e) {
    //编辑用户资料
    var json = JSON.stringify(this.data.userInfo)
    wx.navigateTo({
      url: '/pages/editInfo/editInfo?json=' + json
    })
  },
  toUserDetail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userInfo/userInfo?userId=' + id
    })
  }
})
