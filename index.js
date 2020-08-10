const express = require("express");
const bodyParser = require("body-parser");
const mysql  = require("mysql");
var nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
const mysqlcon = require("./con");
const userRoute =require('./userRouter')
const headerRoute = require('./header');
const adminRoute =require('./admin');
var session = require('express-session');

const app = express();
app.use(express.static("public"));
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended : true })) ;
app.set('view engine' , 'ejs');
app.get('/' , function(req , res){
  res.sendFile(__dirname+'/homepage.html');
});
app.get('/about',headerRoute);
app.get('/staff', headerRoute);
app.get('/feedback' , headerRoute);
app.get('/login',headerRoute);
app.post('/login' , headerRoute);
app.post('/feedback' , headerRoute);
app.get('/department',headerRoute);
app.get('/register',headerRoute);
app.post('/register', headerRoute);
app.get('/mydesk' , headerRoute);
app.get('/message',headerRoute);
app.get('/logout',userRoute);
app.get('/mydetails' , userRoute);
app.get('/mydetails/delete' , userRoute);
app.get('/myappointments',userRoute);
app.get('/appointmentadd',userRoute);
app.post('/appointmentadd',userRoute);
app.get('/mymedications',userRoute);
app.get('/admindesk',headerRoute);
app.post('/admindesk',headerRoute);
app.get('/check/appointment',adminRoute);
app.get('/check/rooms',adminRoute);
app.get('/check/emp',adminRoute);
app.get('/check/details',adminRoute);
app.get('/check/contact',adminRoute);
app.get('/check/treatment',adminRoute);
app.get('/adminpanel',adminRoute);
app.get('/admin/addemp',adminRoute);
app.post('/admin/addemp',adminRoute);
app.get('/adminlogout',adminRoute);
app.post('/',function(req,res){
  let name = req.body.Name ;
  let email = req.body.Email ;
  let message = req.body.Message ;
  mysqlcon.query("insert into ContactUs values (? , ? ,? ,?)",[name , email ,message ,new Date()], function(err , results , fields){
    if (!err) {
      console.log("ContactUs saved successfully");
      res.send("<h1> We are trying to reach you. </h1>  <br> <p>")

    }
    else {
      console.log(err);
    }
  })
});
app.listen(8888 , function() {
    console.log("serving waiting at port 8888 ");
});
