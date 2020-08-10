const express = require('express');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();
const mysqlcon = require('./con');
const mysql = require('mysql');

router.get('/logout',(req,res)=>{
  res.clearCookie('loginId');
  res.redirect('/');
});

router.get('/mydetails',function(req,res){

  let query ="select * from Patient where pid=?";
  let options=[req.cookies.loginId];
  mysqlcon.query(query , options , function(err , results , fields){
     if (!err) {
       let currentUser={
         name:results[0].pname ,
         address:results[0].paddress,
         contact:results[0].pcontact
       };
       res.render('mydetails',{mydetails:currentUser});
     }
  });


});
router.get('/mydetails/delete',(req,res)=>{
  if(req.cookies.loginId){ //user is logged in , delete it
    let query = "delete from Patient where pid=?" ;
    let options = [req.cookies.loginId];
    mysqlcon.query(query,options,(err , results , fields)=>{
      if (!err) {
        res.clearCookie('loginId');
        res.render('message' , { title:"successfully" , message:"Your account is deleted." ,
                    goto:"" , gototitle:" Go to Homepage"});
      }
    });
  }
  else{
    res.render('/message' , {title:"Sorry" , message:"You cannot delete account.Login first to do so.",
                goto:"/" , gototitle:"Home"});
  }

});

router.get('/myappointments',(req,res)=>{
  let query = "select A.descp , E.ename from Appointment A  inner join Employee  E on  A.eid =E.eid where pid =?";
  let options =[req.cookies.loginId];
  mysqlcon.query(query , options ,(err ,results , fields)=>{
    if (!err) {
      if (results.length==0) {
        res.render('message',{
          title:"No Appointment",
          message:"Hey , You have no appointments",
          goto:"appointmentadd",
          gototitle:"Add new appointment"
        })
      }
      else {
        let appointments=results;
        res.render('myappointments',{appointments:appointments});
      }
    }
  });

});

router.get('/appointmentadd',(req,res)=>{
    res.sendFile(__dirname+'/appointmentadd.html');
});
router.post('/appointmentadd',(req,res)=>{
  const descp = req.body.desc  ;
  const ename= req.body.ename ;

  mysqlcon.query("select max(idAppointment) as maxid from Appointment" , function(err , results , fields){

    if (!err) {
      const aid=results[0].maxid + 1 ;
      //incremented aid for new entry
      let query = "select eid from Employee where ename=? ; ";
      let options = [ename];
      //find eid of name specified
      mysqlcon.query(query , options , (err , results , fields)=>{
        if (!err) {
           let eid =results[0].eid ;
           let pid = req.cookies.loginId ;
           mysqlcon.query("insert into Appointment values (?,?,?,?)",[aid,pid,eid,descp],(err,results,fields)=>{
                console.log(aid+""+eid+""+descp+pid);
                if (!err) {
                  res.render('message',{
                    title:"Success",
                    message:"New Appointment is created successfully",
                    goto:"myappointments",
                    gototitle:"Check appointments"
                  })
                  console.log("appointment created successfully");
                }
                });
          }//end of if

        });//end sql query

      }//end if
    });//sql end

  });


router.get('/mymedications',(req,res)=>{
let arr =[];
let query = "select * from Treatment T inner join Employee E on T.eid=E.eid inner join Patient P on T.pid = P.pid and P.pid =? inner join Medicine M on T.medicineId = M.mid  ;"
let options = [req.cookies.loginId];
mysqlcon.query(query,options ,(err , results,fields)=>{
    if (!err) {
      //console.log(results[0]);
      res.render('mymedications',{medications:results})
    }
});
});

router.get('/admin',(req,res)=>{
    res.send("admin login page");
    /* CREATE TABLE `dbms`.`admin` (
  `securitykey` VARCHAR(300) NOT NULL DEFAULT 'abcd',
  `pass` VARCHAR(255) NOT NULL DEFAULT '1234',
  PRIMARY KEY (`securitykey`),
  UNIQUE INDEX `securitykey_UNIQUE` (`securitykey` ASC) VISIBLE);
 */
});



module.exports=router;
