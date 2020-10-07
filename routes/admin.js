var express = require('express');
var router = express.Router();
const { database } = require('../config/helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/surveyAssign',(req,res,next)=>
{
    let result = req.body;
    console.log(result)
    let assigns = result.assigns;
    let keys= Object.keys(result.assigns) 

        keys.forEach(key =>{
            console.log(assigns[key]);
            if( assigns[key] === true)
            {
                database.query(`insert into surveyAssign (who,whom,surveyCaptionId) values (${result.userId},${key},${assigns.surveyCaptionId})`).then((result,err)=>{
                    console.log(result,err)
                }).catch(err=>console.log(err))
            }
            else console.log('eklemedi')
        }) 
        res.send({success:true})  
    
     
    
    

    
})
module.exports = router;
