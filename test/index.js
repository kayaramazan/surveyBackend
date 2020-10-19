const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app') 

chai.use(chaiHttp)

describe('users', ()=>{
    describe('GET /users',()=>
    {
        it('Users donucek',(done)=>{
            chai.request(app)
            .get('/api/users')
            .end((err,res)=>{
                if(err) done(err)
                .expect(res).to.have.status(200)
                .expect(res.body).to.be.an('array')
                done();
            })   
        })
    }),
    describe('Anket Sorularini Listelene',()=>{
        describe('GET  /survey/questions',()=>{
            it('Sorular ve cevap siklari cekilicek',(done)=>{
                chai.request(app)
                .get('api/survey/questions')
                .end((err,res)=>{ 
                    if(err) done(err) 
                    .expect(res).to.have.status(200)
                    .expect(res.body).to.be.an('array')
                    done();
                })
            })
        })
    }) 
})