var express = require('express');
var router = express.Router(); 
var md5 = require('md5');
const { v4: uuidv4 } = require('uuid');
const { database } = require('../config/helpers')
var jwt = require('jsonwebtoken'); 
const authReqAdmin=123123
/* GET home page. */
router.get('/', function(req, res, next) {
  
    database.query(`select * from users where authority != ${authReqAdmin} `).then(result => {
        res.send(result)
    }).catch(err => {
        res.status(200).send('Something went wrongss !!')
    })
    
});

router.post('/delete',(req,res,next)=>
{ 
    let userId = req.body.userId
    database.query(`delete from users where id=${userId}`).then(result=>
        {
        res.status(200).send({success:true})
    }).catch(err=>{
        console.log(err)
        res.status(300).send({success:false})
    })
})

router.post('/login',function (req,res,next) { 
   
    let user = req.body
    if(user.username)
    {
        database.query(`select * from users where username="${user.username}" and password = "${md5(user.password)}"`)
        .then(result => {
            if(result.length>0)
            { 
                res.status(200).send({result:jwt.sign(JSON.stringify(result), 'shhhhh')})
            }else
            res.status(200).send('Kullanici bulunamadi')
        }).catch(err => console.log(err))
    }else
    res.send('Failed')
})
// Kullaniciya atanan anketi kaldirir
router.post('/removeAssign',function (req,res,next) { 
    let assignId = req.body.assignId 
    if(assignId)
    {
        database.query(`delete from surveyAssign where id=${assignId}`)
        .then(result => {
            if(result)
            {
                res.status(200).send({success:true})
            }
        }).catch(err =>
            {
            res.send({success:false})
            console.log(err)
            })
    }else
    res.send({success:false})
})

router.post('/register', function(req, res, next) {
    let user = req.body;  
    if(user.username && user.department)
    {
        
        database.query(`insert into users (username,department,password) values ("${user.username}","${user.department}","${md5(user.password)}")`)
        .then((result,err) => { 
            if(result)
            {
                res.status(200).send({success:true})
            }

        }).catch(err => {
            console.log(err)
            res.status(200).send({success:false})
        })
    }else
    res.send({success:false}) 
    
});

router.post('/results',(req,res,next)=>
{
    console.log(req.body)
    let { captionId,id,userId } = req.body; 
    // database.query(`select sc.surveyTitle,a.id, u.username,s.surveyQuestion, sa.answer from answers a join survey s on a.questionId = s.id join surveyAnswers sa on a.answerId = sa.id join users u on a.surveyUserId = u.id join surveyCaption sc on sc.id=s.surveyCaptionId where userId = ${id} order by username,sc.surveyTitle desc`).then(result =>{
    database.query(`select sc.surveyTitle,a.id, u.username,s.surveyQuestion, sa.answer,sa.score from answers a join survey s on a.questionId = s.id join surveyAnswers sa on a.answerId = sa.id join users u on a.surveyUserId = u.id join surveyCaption sc on sc.id=s.surveyCaptionId where userId =${userId} and sc.id = ${captionId} and u.id = ${id} order by username,sc.surveyTitle`)
    .then(result =>{   
    res.status(200).send(result)
    }).catch(err => {
        res.status(300).send({error:'Something went wrong !!'})
    })


})


router.get('/resultsById/:id',(req,res,next)=>
{
    let id = req.params.id;
    // database.query(`select sc.surveyTitle,a.id, u.username,s.surveyQuestion, sa.answer from answers a join survey s on a.questionId = s.id join surveyAnswers sa on a.answerId = sa.id join users u on a.surveyUserId = u.id join surveyCaption sc on sc.id=s.surveyCaptionId where userId = ${id} order by username,sc.surveyTitle desc`).then(result =>{
    database.query(`select sc.surveyTitle,a.id, u.username,s.surveyQuestion,sa.score, sa.answer from answers a join survey s on a.questionId = s.id join surveyAnswers sa on a.answerId = sa.id join users u on a.surveyUserId = u.id join surveyCaption sc on sc.id=s.surveyCaptionId where userId = ${id} order by username,sc.surveyTitle desc`)
    .then(result =>{   
    res.status(200).send(result)
    }).catch(err => {
        res.status(300).send({error:'Something went wrong !!'})
    })


})
router.get('/totalResult', (req,res)=>
{ 
     database.query(`select u.username,count(s.id) as qCount,sum(score) as score from surveyAnswers sa join answers a on a.answerId=sa.id join users u on a.surveyUserId = u.id join survey s on s.id=a.questionId GROUP by u.username`)
    .then(result =>{   
    res.status(200).send(result)
    }).catch(err => {
        res.status(300).send({error:'Something went wrong !!'})
    })
})
router.get('/results/:id',(req,res,next)=>
{
    let id = req.params.id;
    // database.query(`select sc.surveyTitle,a.id, u.username,s.surveyQuestion, sa.answer from answers a join survey s on a.questionId = s.id join surveyAnswers sa on a.answerId = sa.id join users u on a.surveyUserId = u.id join surveyCaption sc on sc.id=s.surveyCaptionId where userId = ${id} order by username,sc.surveyTitle desc`).then(result =>{
    database.query(`select sc.id as captionId,sc.surveyTitle,a.userId, u.id, u.username,u.department, sum(score) as score from surveyAnswers sa join answers a on sa.id = a.answerId join surveyCaption sc on sc.id = sa.surveyCaptionId join users u on u.id= a.surveyUserId group by a.surveyUserId,captionId,userId having userId =${id}`)
    .then(result =>{   
    res.status(200).send(result)
    }).catch(err => {
        res.status(300).send({error:'Something went wrong !!'})
    })


})
router.get('/resultUser',(req,res,next) =>
{ 
    database.query(`select * from users where id in(SELECT userId FROM answers GROUP by userId)`).then(result => {
        res.send(result)
    }).catch(err => {
        res.status(300).send({error:'Something went wrong !!'})
    })
})
router.get('/:userId',(req,res,next)=>
{ let finalResult = [],temp = []
    userId = req.params.userId;  

    // and u.id not in(select surveyUserId from answers where userId = ${userId})
    database.query(`select u.id as id,sa.who,sa.whom,u.department as department,sa.surveyCaptionId,u.username as username,sc.surveyTitle as surveyTitle from surveyAssign as sa join users u on u.id=sa.whom join surveyCaption sc on sc.id = sa.surveyCaptionId where sa.who = ${userId}  order by u.username`)
    .then(result => {
        
        database.query(`SELECT * FROM answers WHERE userid=${userId}`).then(item =>{ 
            if(item.length == 0)
            res.send(result) 
            console.log(result)
            item.forEach(i => {
            // temp.push(result.filter(element=>element.surveyCaptionId != i.surveyCaptionId || element.whom != i.surveyUserId))
            let existIndex = (result.findIndex(element=>element.surveyCaptionId == i.surveyCaptionId && element.whom == i.surveyUserId))
            console.log("silindi",existIndex)
            if(existIndex >=0)
            result.splice(existIndex,1)

            console.log(result)
            //    temp.forEach(e => {
            //     finalResult.push(e)
            //     });
            // temp.length = 0;
            }) 
        }).then(()=>{   
            res.send(result)
        }).catch(err => {
            console.log(err)
            res.send({success:false})
        })
    }).catch(err => {
        res.status(300).send('Something went wrong !!')
        console.log(err)
    }) 
})


module.exports = router;
