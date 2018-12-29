// miniprogram/pages/wrong/wrong.js
const questionService = require('../../api/question.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [],          // 数据
    id: '',             // 当前题目类型
    getId: '',          // 当前题目的id
    typeClass: 1,       // 区分问题name是图片描述还是文字描述    1  文字  2  图片
    selectType: 1,      // 区分是多选题,单选题等
    title: '',          // 标题内容
    titleType: 'text',  // 判定标题是否是图片  text img
    tf: true,           // 当前是否作对
    hidden: false,      // 加载动画
    currentPage: 0,     // 默认当前页 0  每页数据20条
    pageNumber: 1,      // 当前累计请求的条数  最大20条  超出置零
    ifChecked: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    questionService.findAnswerWrongQuestion({
      openId: app.globalData.openId,
      query: {
        row: _this.data.currentPage,
        num: _this.data.pageNumber
      },
      success(res) {
        if (res.data.length <= 0) {
          _this.setData({
            hidden: true,
            tf: true
          })
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          return
        }
        console.log(res, res.data[0])
        // 获取到当前的
        _this.getDetails(res.data[0].questionId)
      },
      fail(err) {
        _this.setData({
          hidden: true
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 自定义事件部分
   */
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value == 'false') {
      this.setData({
        tf: e.detail.value
      })
    } else {
      this.getNextProblem()
    }

  },
  nextProblem: function () {
    this.getNextProblem()
  },
  getNextProblem: function () {
    // 获取下一题
    let _this = this
    this.setData({
      hidden: false
    })
    this.setData({
      pageNumber: _this.data.pageNumber == 20 ? 0 : (_this.data.pageNumber + 1),
      currentPage: _this.data.pageNumber == 20 ? (currentPage + 1) : _this.data.pageNumber
    })

    questionService.findAnswerWrongQuestion({
      openId: app.globalData.openId,
      query: {
        row: _this.data.currentPage,
        num: _this.data.pageNumber
      },
      success(res) {
        if (res.data.length <= 0) {
          _this.setData({
            hidden: true,
            tf: true
          })
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          return
        }
        console.log(res, res.data[0].questionId)
        // 获取到当前的
        _this.getDetails(res.data[0].questionId)
      },
      fail(err) {
        console.log(err)
        _this.setData({
          hidden: true
        })
      }
    })

  },
  delNote: function () {
    console.log(this.data.getId)
    let _this = this
    this.setData({
      hidden: false
    })
    // 删除错题集
    questionService.deleteAnswerWrongQuestion({
      id: this.data.getId,
      success(res) {
        console.log(res)
        _this.setData({
          hidden: true
        })

        wx.showToast({
          title: '删除错题成功',
          icon: 'success',
          mask: true,
          duration: 2000
        })
      },
      fail(err) {
        console.log(err)
        _this.setData({
          hidden: true
        })
        wx.showToast({
          title: '删除错题失败',
          icon: 'success',
          mask: true,
          duration: 2000
        })
      }
    })
  },
  getDetails (id) {
    let _this = this
    questionService.findQuestionDetail({
      questionId: id,
      success (res) {
        console.log(res)
        _this.setData({
          items: questionService.shuffle(res.data[0].options),
          getId: res.data[0].categoryId,
          typeClass: res.data[0].question_type,
          title: res.data[0].question_name,
          selectType: res.data[0].type,
          titleType: _this.data.typeClass === 1 ? 'text' : 'img',
          hidden: true
        })
      },
      fail (){
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
        _this.setData({
          hidden: true,
          tf: 'false'
        })
      }
    })
  }
})
