var express = require('express');
var router = express.Router();
const { database } = require('../config/helpers')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// sorular ve cevaplari cekiliyor
router.get('/questions',(req,res) =>{
   
  database.query('select a.id as cevapId,q.id, q.surveyQuestion,a.answer from survey q join surveyAnswers a on q.id = a.QuestionId join surveyCaption sc on q.surveyCaptionId=sc.id  ').then(
    result => 
    {
      res.status(200).send(result)
    }).catch(
      err => 
    {
      res.status(300).send('Something went wrong !!')
    })
})

//butun yanitlari ceker
router.get('/getAllAnswer',(req,res)=>{
  database.query('select u.username,a.surveyUserId ,q.surveyQuestion ,sa.answer from answers a  join users u on a.userId = u.id   join surveyAnswers sa on a.answerId = sa.id join survey q on a.questionId = q.id ')
  .then(result =>{  
      res.send(result)
    
  }).catch(
    err => 
  {
    res.status(300).send('Something went wrong !!')
  })
})

//Anket isimlerini ceker
router.get('/title',(req,res)=>{
  database.query('select * from surveyCaption')
  .then(result =>{  
      res.send(result)
    
  }).catch(
    err => 
  {
    res.status(300).send('Something went wrong !!')
  })
})

// yeni soru ve cevaplari eklenir
router.post('/new', (req, res) => { 
  let survey = req.body;
  console.log(survey)
  let surveyQuestion = survey.question;
  
  let answers = []
  survey.answers.forEach(element => {
    answers.push(element);
    if(element == "") 
      res.send({success:false})
  });
  if(survey.question == "")
    res.send({success:false})

  database.query(`insert into survey (surveyQuestion,surveyCaptionId) values ("${surveyQuestion}",${survey.surveyCaptionId})`)
    .then(result => {
      questionId = result.insertId;
      answers.forEach(item => {
        database.query(`insert into surveyAnswers (questionId,answer) values (${questionId},"${item}")`)

      })
    }).catch(err => console.log(err))
  res.status(200).send({success:true});

})
// Yeni anket ismi ekleniyor
router.post('/newCaption',(req,res)=>{
  console.log(req.body)
  if(req.body.caption!="")
  {
    database.query(`insert into surveyCaption (surveyTitle) values ("${req.body.caption}")`).then(result=>{
      res.send({success:true})
    }).catch(err => console.log(err))
  }
  else
  res.send({success:false})
})
// Oylanan anket ekleme islemi yapiliyor
router.post('/finalAnswer', (req,res) =>
{ 
  console.log(req.body)
  let result  = req.body.answers.results;
  let userId = req.body.answers.userId;
  let surveyUserId = req.body.answers.surveyUserId; 
  
   result.forEach(item =>
   {
     console.log(item)
       database.query(`insert into answers (questionId,answerId,userId,surveyUserId) values (${item.questionId},${item.answerId},${userId},${surveyUserId})`)
       .then(e => console.log('inserted'))
       .catch(err => console.log(err));
   })
   res.send({succes:true})
})



module.exports = router;
