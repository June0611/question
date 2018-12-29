// miniprogram/pages/list/list.js
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
    tf: 'false',           // 当前是否作对
    hidden: false,      // 加载动画
    currentPage: 0,     // 默认当前页 0  每页数据20条
    pageNumber: 1,      // 当前累计请求的条数  最大20条  超出置零
    ifChecked: false,
    current_item: -1,
    note: 'false'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    let _this = this
    questionService.findQuestionByCategory({
      categoryId: _this.data.id,
      query: {
        row: _this.data.currentPage,
        num: _this.data.pageNumber
      },
      success(res) {
        console.log(res)
        if (res.data.length <= 0) {
          _this.setData({
            hidden: true,
            tf: 'true',
            note: 'true'
          })
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          return
        }
        for (let i = 0; i < res.data[0].options.length; i++) {
          res.data[0].options[i].status = false
          res.data[0].options[i].disabled = false
        }
        _this.setData({
          items: questionService.shuffle(res.data[0].options),
          getId: res.data[0]._id,
          typeClass: res.data[0].question_type,
          title: res.data[0].question_name,
          selectType: res.data[0].type,
          titleType: res.data[0].question_type === 1 ? 'text':'img',
          hidden: true
        })
        console.log(_this.data.titleType, res.data[0].question_type)
        if (_this.data.items.length <= 0) {
          _this.setData({
            hidden: true,
            tf: 'true'
          })
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          return
        }
      }
    })
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
    // if (e.detail.value == 'false'){
    //   this.setData({
    //     tf: e.detail.value
    //   })
    // }else{
    //   this.getNextProblem()
    // }
    /*
     *  此处设置如果  e.detail.value == 'false'
     *  1、所有全部禁用
     *  2、选正确的
     *  3、错误的横线
     * 
     *  此处设置如果  e.detail.value == 'true'
     *  不做处理
     */
    if (e.detail.value == 'false') {
      this.putNote()
      this.setData({
        note: 'true'
      })
      let tmpItems = [];
      for (let i = 0; i < this.data.items.length; i++) {
        let itemdisabled = 'items[' + i + '].disabled'
        let itemstatus = 'items[' + i +'].status'
        this.setData({
          [itemdisabled]: true,
          [itemstatus]: this.data.items[i].correct
        })
      }
    }else{
      this.getNextProblem()
    }
  },
  selectRadio: function (e) {
    console.log(e.currentTarget.dataset.status == true)
    if (e.currentTarget.dataset.status == true){
      return
    }
    let cuu = e.currentTarget.dataset.key;//获取index值
    this.setData({
      current_item: cuu
    })
  },
  nextProblem: function () {
    this.putNote()
    this.getNextProblem()
  },
  getNextProblem: function () {
    // 获取下一题
    let _this = this
    this.setData({
      hidden: false,
      ifChecked: false,
      note: 'false',
      tf: 'false'
    })
    this.setData({
      // pageNumber: _this.data.pageNumber == 20 ? 0 : (_this.data.pageNumber+1),
      currentPage: ++_this.data.currentPage
    })
    
    questionService.findQuestionByCategory({
      categoryId: _this.data.id,
      query: {
        row: _this.data.currentPage,
        num: _this.data.pageNumber
      },
      success(res) {
        for (let i = 0; i < res.data[0].options.length; i++) {
          res.data[0].options[i].status = false
          res.data[0].options[i].disabled = false
        }
        _this.setData({
          current_item: -1,
          items: questionService.shuffle(res.data[0].options),
          getId: res.data[0]._id,
          typeClass: res.data[0].question_type,
          title: res.data[0].question_name,
          selectType: res.data[0].type,
          titleType: _this.data.typeClass === 1 ? 'text' : 'img',
          hidden: true,
          tf: 'false'
        })
      
        if (_this.data.items.length <= 0) {
          _this.setData({
            tf: 'true'
          })
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          return
        }
      }
    })

  },
  putNote: function () {
    let _this = this
    this.setData({
      hidden: false
    })
    // 加入错题集
    questionService.reportAnswerWrongQuestion({
      questionId: this.data.getId,
      openId: app.globalData.openId,
      success (res) {
        console.log(res)
        _this.setData({
          hidden: true
        })

        wx.showToast({
          title: '加入错题成功',
          icon: 'success',
          mask: true,
          duration: 2000
        })
      },
      fail(err){
        console.log(err)
        _this.setData({
          hidden: true
        })
        wx.showToast({
          title: '加入错题失败',
          icon: 'success',
          mask: true,
          duration: 2000
        })
      }
    })
  }
})