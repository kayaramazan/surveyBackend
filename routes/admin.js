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
    let assigns = result.assigns;
    let keys= Object.keys(result.assigns) 

        keys.forEach(key =>{
            console.log(assigns[key]);
            if(assigns[key] == true)
            {
                database.query(`insert into surveyAssign (who,whom) values (${result.userId},${key})`)
            }
        }) 
        res.send({success:true})  
    
     
    
    

    
})
module.exports = router;
