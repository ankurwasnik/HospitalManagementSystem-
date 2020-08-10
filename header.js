const express = require('express');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();
const mysqlcon = require('./con');
const mysql = require('mysql');
const admin = require('./admin');

router.get('/about',function(req , res){
  res.sendFile(__dirname + '/about.html');
});

router.get('/staff',function(req,res){
   mysqlcon.query("select ename , etype from Employee ;" , function(err , results , fields){
    if (!err) {
      let arr = [];
      console.log("staff queried successfully");
      for (var i = 0; i < results.length; i++) {
        if (results[i]) {
          let newObject = {name:results[i].ename , content:results[i].etype};
          arr.push(newObject);
        }

      }
      res.render('details',{featureName:"Amazing Staff ",
      featureBrief:"This are my amazing staff working hard to ensure you keep smiling" ,
       cards:arr})
    }
    else {
      console.log("employee queried discarded");

    }
  })

});

router.get('/feedback' , function(req,res){
  mysqlcon.query("select * from Feedback ;" , function(err , results , fields){
    if (!err) {
      console.log("You are on feedback page");
      let arr = [];
      for (var i = 0; i < results.length; i++) {
        let date = results[i].date.getDate() + "/"+ results[i].date.getMonth() + "/" + results[i].date.getFullYear() ;
        let newObject = { heading:results[i].heading , desc:results[i].desc , date : date , name:results[i].name} ;
        arr.push(newObject);
      }
      res.render('feedback' , {Feedbacks:arr});
    }
  })

});

router.post('/feedback',function(req,res){
   const name = req.body.Name ;
   const email = req.body.Email ;
   const message = req.body.Message ;
   mysqlcon.query("insert into Feedback values(? , ? ,?)",[email , message , new Date()] , function(err , results , fields){
     if (!err){
       console.log("Feedback recorded successfully");
       res.render('message',{
         title:"Success",
         message:"Your feedback response is recorded.",
         goto:"",
         gototitle:"Continue to Home"
       })
      }
      else {
        res.render('message',{
          title:"Something went wrong!",
          message:"",
          goto:'feedback',
          gototitle:"Try Again"
        })
      }

   });

});

router.get('/login', function(req,res,err){
  if (req.cookies.loginId) {
    //user logged in already
    res.clearCookie('adminId');
    console.log(req.cookies);
    res.redirect('/mydesk');
  }
  else {
    if (req.cookies.adminId) {
      res.clearCookie('loginId');
      res.render('message',{
        title:"Sorry",
        message:"You are logged in as Admin.",
        goto:"adminpanel",
        gototitle:"Continue on Admin Control Panel"
      })
    }
    else {
      { //user is not logged in
         res.sendFile(__dirname+'/login.html')
      }
    }
  }




});
router.post('/login',(req,res)=>{
    // check if user already login , redirect to home user else redirect to make login

    let contact=req.body.Phone ;
    let password=req.body.userPassword;
     let query = " select pid from Patient where pcontact=? and userpassword = ?";
     let options = [contact , password] ;
     mysqlcon.query(query , options , function(err , results , fields){
       if (!err && results.length!=0) {
         let news = [ {heading:"News :Corona cases increased in India.",
                      description:"News Details 1:crazy news aboout corona cases in India ." } ,
                      {heading:"Free checkup campaing on 28th April",
                      description:"We have to take care fo this campaing which includes free check up for all"}] ;
                      console.log(results);

         res.cookie('loginId',results[0].pid).redirect('/mydesk');

       }
       else {
         //send user to register
         res.render('message',{
           title:"Oops!",
           message:"Invalid account details.",
           goto:"register",
           gototitle:"Create Account"
         })

       }
     });



});

router.get('/mydesk',(req,res)=>{
    if (req.cookies.loginId) {
      let news = [ {heading:"News :Corona cases increased in India.",
                   description:"News Details 1:crazy news aboout corona cases in India ." } ,
                   {heading:"Free checkup campaing on 28th April",
                   description:"We have to take care fo this campaing which includes free check up for all"}]
      res.render('user',{News:news});
    }
});

router.get('/department',(req,res)=>{
  let query = 'select dept_name , dept_desc from Department';
  mysqlcon.query(query,function(err , results , fields){
    if (!err) {
      let arr=[];
      for (var i = 0; i < results.length; i++) {
        if (results[i]) {
          let newObject = {name:results[i].dept_name , content:results[i].dept_desc};
          arr.push(newObject);
        }
      }
      res.render('details',{featureName:"Amazing Departments ",
      featureBrief:"This are my amazing department working hard to ensure you keep smiling" ,
       cards:arr});
    }
  });
});

router.get('/register',(req,res)=>{
  if (req.cookies.loginId) {
    res.render('message',{title:"You are already Logged In." , message:"Please continue to Mydesk"
              ,goto:"mydesk" , gototitle:"My Desk"});
  }else {
    if (req.cookies.adminId) {
      res.render('message',{
        title:"Sorry",
        message:"You are logged in as Admin.",
        goto:"adminpanel",
        gototitle:"Please Continue on Admin Desk"
      })
    } else {
      res.sendFile(__dirname+'/register.html');

    }
  }

});

router.post('/register',(req,res)=>{
var pid=0;
let name=req.body.name;
let address = req.body.address ;
let contact  = req.body.contact ;
let password = req.body.password ;
console.log(name + " " + address + contact + password);
mysqlcon.query("select max(pid) as maxid from Patient" , function(err , results , fields){
  if (!err) {
    pid=results[0].maxid + 1 ;
    //incremented pid for new entry
    let query = "insert into Patient values(?,?,?,?,?)";
    let options = [pid,name , address , contact , password];
    //adding to database
    mysqlcon.query(query , options , (err , results , fields)=>{
      if (!err) {
        res.render('message',{
          title:"Success",
          message:"You have successfully created account.",
          gototitle:"Login to continue",
          goto:"login"
        } ) ;
                // res.redirect('/login');
      }
    });
  }
});
});

router.get('/admindesk',(req,res)=>{
  if (req.cookies.loginId) {
    res.clearCookie('adminId');
      res.render('message',{
        title:"Sorry,You are logged in as User.",
        message:"Please logout from user control panel and continue" ,
        gototitle:"Continue on User Desk",
        goto:"mydesk"
      });
  }
  else {
    if (req.cookies.adminId) {
      res.clearCookie('loginId');
      res.render('message',{
        title:"Sorry.",
        message:"You are logged in as Admin " ,
        gototitle:"Continue on Admin Desk",
        goto:"adminpanel"
      });
    } else {
      res.sendFile(__dirname+'/adminlogin.html');

    }
  }
});

router.post('/admindesk',(req,res)=>{
  let skey=req.body.skey;
  let  pass = req.body.pass ;
  let query ="select * from Admin where securitykey=? and pass=? ;" ;
  let options = [skey , pass];
  mysqlcon.query(query,options,(err , results,fields )=>{
        if (!err) {
      if (results.length>0) { // valid admin
        console.log(results[0]);
        res.clearCookie('loginId');
        res.cookie('adminId',results[0].pid).render('admin',{});
        }
      else {
        res.clearCookie('loginId');
        res.clearCookie('adminId');
        res.render('message',{
          title:"Invalid Credentials",
          message:"There is no such account with given detials.",
          goto:"",
          gototitle:"Go To Home"
        })
      }

    }
  });
});

module.exports = router ;
