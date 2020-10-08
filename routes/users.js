var express = require('express');
var router = express.Router(); 
const { database } = require('../config/helpers')
/* GET home page. */
router.get('/', function(req, res, next) {
  
    database.query('select * from users where authority != 1').then(result => {
        res.send(result)
    }).catch(err => {
        res.status(200).send('Something went wrongss !!')
    })
    
});

router.post('/delete',(req,res,next)=>
{
    console.log('asad')
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
        database.query(`select * from users where username="${user.username}" and password = "${user.password}"`)
        .then(result => {
            if(result.length>0)
            {
                res.status(200).send(result)
            }else
            res.status(200).send('Kullanici bulunamadi')
        }).catch(err => console.log(err))
    }else
    res.send('Failed')
})



router.post('/register', function(req, res, next) {
    let user = req.body;  
    if(user.username && user.department)
    {
        
        database.query(`insert into users (username,department,password) values ("${user.username}","${user.department}","${user.password}")`)
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
router.get('/results/:id',(req,res,next)=>
{
    let id = req.params.id;
    database.query(`select a.id, u.username,s.surveyQuestion, sa.answer from answers a join survey s on a.questionId = s.id join surveyAnswers sa on a.answerId = sa.id join users u on a.surveyUserId = u.id where userId = ${id} order by username`).then(result =>{
        res.send(result)
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
    database.query(`select u.id as id,sa.who,sa.whom,u.department as department,sa.surveyCaptionId,u.username as username,sc.surveyTitle as surveyTitle from surveyAssign as sa join users u on u.id=sa.whom join surveyCaption sc on sc.id = sa.surveyCaptionId where sa.who = ${userId}  order by u.username`).then(result => {
        
        database.query(`SELECT * FROM answers WHERE userid=${userId}`).then(item =>{ 
            console.log('-------------');
            if(item.length == 0)
            res.send(result)
            item.forEach(i => {
            temp.push(result.filter(element=>element.surveyCaptionId != i.surveyCaptionId || element.whom != i.surveyUserId))
               
               temp.forEach(e => {
                finalResult.push(e)
                });
            temp.length = 0;
            })
            console.log(finalResult[0]) 
            console.log(result) 
        }).then(()=>{ 
            res.send(finalResult[0])
        })
    }).catch(err => {
        res.status(300).send('Something went wrong !!')
    })
})


module.exports = router;
