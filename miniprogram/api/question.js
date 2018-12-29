
const db = wx.cloud.database()

/**
 * api使用示例
 * //引入模块
 * const questionService = require('../../api/question.js')
 * //方法调用
 * questionService.findCategoryByLevel({
 *    level:5,
 *    success(res){
 *      console.log(res)
 *    }
 * })
 */





/**
 * 根据等级查找问题类别
 * obj {
 *    level:1        //等级1,2,3,4,5,6,7,8
 *    query:{
 *      row:1,
 *      num:20
 *    }
 *    success(res){} //结果回调
 * }
 */
const findCategoryByLevel = obj => {
  let row = obj.query && obj.query.row ? obj.query.row : 0
  let num = obj.query && obj.query.num ? obj.query.num : 20
  let skip = row * num

  var query = db.collection('question_category').where({
    level:obj.level
  }).limit(num)
  
  if(skip > 0){
    query = query.skip(skip)
  }
  query.get({
    success(res) {
      if (obj.success){
        obj.success(res)
      }
    }
  })
}


/**
 * 根据问题类别查找问题
 * obj {
 *    categoryId:id,//类别ID
 *    query:{
 *      row:0, //default
 *      num:20 //default
 *    }
 *    success(res){}//结果回调
 * }
 */
const findQuestionByCategory = obj => {
  let row = obj.query && obj.query.row ? obj.query.row : 0
  let num = obj.query && obj.query.num ? obj.query.num : 20
  let skip = row * num

  var query = db.collection('question').where({
    categoryId: obj.categoryId
  }).limit(num)
  if (skip > 0) {
    query = query.skip(skip)
  }
  query.get({
    success(res) {
      console.log(res)
      if (obj.success) {
        obj.success(res)
      }
    }
  })
}


/**
 * 3.查找错误问题(分页)
 * openId:'',
 * query:{
 *    row:0, //default
 *    num:20 //default
 * }
 * success(res){}//结果回调
 */
const findAnswerWrongQuestion = obj => {
  let row = obj.query && obj.query.row ? obj.query.row : 0
  let num = obj.query && obj.query.num ? obj.query.num : 20
  let skip = row * num


  var query = db.collection('answer_wrong').where({
    openId: obj.openId,
    delFlag:false
  }).limit(num)
  if (skip > 0) {
    query = query.skip(skip)
  }
  query.get({
    success(res) {
      console.log(res)
      if (obj.success) {
        obj.success(res)
      }
    },
    fail(err) {
      console.log(err)
      if (obj.fail) {
        obj.fail(err)
      }
    }
  })

}


/**
 * //4.删除错误问题
 * obj:{
 *    id:错误问题ID//非问题ID
 *    success(res){}//成功回调
 *    fail(err){}//失败回调
 * }
 */
const deleteAnswerWrongQuestion = obj => {
  db.collection('answer_wrong').doc(obj.id).update({
    data:{
      delFlag:true
    }
  }).then(res => {
    if (obj.success) {
      obj.success(res)
    }
  }).catch(err => {
    if (obj.fail) {
      obj.fail(err)
    }
  })

}


/**
 * //5.报告错误问题
 * obj:{
 *    questionId:'',//问题ID
 *    openId:''//用户openID,从登陆接口获取
 *    success(res){}//成功回调
 *    fail(err){}//失败回调
 * }
 */
const reportAnswerWrongQuestion = obj => {
  var collection = db.collection('answer_wrong')
  collection.where({
    questionId:obj.questionId,
    openId:obj.openId
  }).limit(1).get({
    success(res){
      if(res.data.length > 0){
        //已经存在,进行更新
        var data = res.data[0]
        collection.doc(data._id).update({
          data:{
            delFlag:false,
            count:data.count+1
          }
        }).then(res => {
          if (obj.success) {
            obj.success(res)
          }
        }).catch(err => {
          if (obj.fail) {
            obj.fail(err)
          }
        })
      }else{//增加一条新数据
        collection.add({
          data:{
            questionId: obj.questionId,
            openId: obj.openId,
            delFlag: false,
            count: 1
          }
        }).then(res => {
            //记录成功或失败
          if (obj.success) {
            obj.success(res)
          }
        }).catch(err => {
          if (obj.fail) {
            obj.fail(err)
          }

        })
      }
    }
  })

}


//
/**
 * 6.获取问题详情
 * obj:{
 *    questionId:'',//问题ID
 *    success(res){}//回调
 * }
 */
const findQuestionDetail = obj => {
  db.collection('question').doc(obj.questionId).get({
    success(res){
      if (obj.success) {
        obj.success(res)
      }
    },
    fail(err) {
      if(obj.fail){
        obj.fail(err)
      }
    }
  })
}

// 打散数组函数
const shuffle = (aArr) => {
  aArr.sort(randomsort);
  return aArr
};

const randomsort = () => {
  return Math.random() > .5 ? -1 : 1;
  //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
}

module.exports = {
  reportAnswerWrongQuestion: reportAnswerWrongQuestion, 
  deleteAnswerWrongQuestion: deleteAnswerWrongQuestion,
  findAnswerWrongQuestion  : findAnswerWrongQuestion,
  findQuestionByCategory   : findQuestionByCategory,
  findCategoryByLevel      : findCategoryByLevel ,
  findQuestionDetail       : findQuestionDetail,
  shuffle                  : shuffle
}
