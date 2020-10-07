var express = require('express');
var router = express.Router(); 
const { database } = require('../config/helpers')
/* GET home page. */
router.get('/', function(req, res, next) {
  
    database.query('select * from users where authority != 1').then(result => {
        res.send(result)
    }).catch(err => {
        res.status(200).send('Something went wrong !!')
    })
    
});



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
{ 
    userId = req.params.userId; 
    // select * from users u join surveyAssign sc on sc.whom = u.id where u.id in (select whom from surveyAssign where who = 16) and u.id not in(select surveyUserId from answers where userId = 16)

    database.query(`select * from users where id in (select whom from surveyAssign where who = ${userId}) and id not in(select surveyUserId from answers where userId = ${userId})`).then(result => {
        res.send(result)
    }).catch(err => {
        res.status(300).send('Something went wrong !!')
    })
})


module.exports = router;
