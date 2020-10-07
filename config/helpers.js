const mysqli = require('mysqli')

let conn =new mysqli(
    {
        host: 'localhost',
        post: 3306,  
        user: 'root',  
        passwd: '',  
        charset: 'utf8_general_ci',  
        db: 'survey'
      }
)

let db = conn.emit(false,'');
module.exports = {
    database:db
};