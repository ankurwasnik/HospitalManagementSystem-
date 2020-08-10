const express = require('express');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();
const mysqlcon = require('./con');
const mysql = require('mysql');

router.get('/adminpanel' , (req,res)=>{
  if (req.cookies.loginId) {
    res.render('message',{
      title:"sorry",
      message:"You cannot access Admin Control Panel ",
      goto:"mydesk",
      gototitle:"Continue on User Desk"
    })
  }
  else {
    if (req.cookies.adminId) {
      res.render('admin',{})
    }
  }
});

router.get('/check/appointment',(req,res)=>{
  let query ="select descp ,pname ,paddress,pcontact, ename ,etype from Appointment A  inner join Patient P on A.pid = P.pid inner join Employee E on A.eid = E.eid ; "
  mysqlcon.query(query,(err , results , fields)=>{
    console.log(results);
    res.render('admincontent',{results:results })
  });
});

router.get('/check/rooms',(req,res)=>{
  mysqlcon.query("SELECT * FROM dbms.Room order by isavail;",(err, results ,fields)=>{
    console.log("rooms "+results);
    res.render('checkroom',{results:results})
  });
});

router.get('/check/emp',(req,res)=>{
  mysqlcon.query("select * from Employee order by isregistered desc",(err,results,fields)=>{
    if (!err) {
      res.render('checkemp',{results:results});
    }

  });
});
router.get('/check/details',(req,res)=>{
  mysqlcon.query("select * from Patient order by pname ",(err,results,fields)=>{
    if (!err) {
      res.render('checkpatients',{results:results});
    }

  });
});

router.get('/check/contact',(req,res)=>{
  mysqlcon.query("SELECT Email,Name,Message ,date_format(date,'%d/%m/%Y ') as date FROM dbms.ContactUs order by date desc ;",(err,results,fields)=>{
    if (!err) {
      res.render('checkcontact',{results:results});
    }

  });
});
router.get('/check/treatment',(req,res)=>{
let query="SELECT pname,pcontact,ename,etype,espec,roomId,rtype,rblock,rfloor,mname,mdesc FROM Treatment T join Patient P on T.pid=P.pid join Employee E on E.eid = T.eid join Room R 	on R.roomId=T.rnumber join Medicine M on M.mid = T.medicineId;" ;
  mysqlcon.query(query,(err,results,fields)=>{
    if (!err) {
      res.render('checktreatment',{results:results});
    }

  });
});

router.get('/admin/addemp',(req,res)=>{
    if (req.cookies.adminId) {
      res.sendFile(__dirname+'/addemp.html');
    }else {
      res.redirect('/');
    }
});
router.post('/admin/addemp',(req,res)=>{
  let ename =req.body.ename;
  let etype = req.body.etype;
  let espec= req.body.espec ;
  let isregistered = req.body.isregistered;
  mysqlcon.query('select * from Employee where ename=? and etype=? and espec=? ',[ename,etype,espec],
    (err,results,fields)=>{
      if (results.length==0 && !err) {

        mysqlcon.query('select max(eid) as maxid from Employee;',(err,result,fields)=>{
          let eid = result[0].maxid+1 ;
          if (!err) {
            mysqlcon.query('insert into Employee values(?,?,?,?,?)',[eid,ename,etype,espec,isregistered],(err,results,fields)=>{
              res.render('message',{
                title:'Success',
                message: ename + " is our new memeber of Employee family",
                gototitle:"Continue to Admin Desk",
                goto:"adminpanel"
              })
            });
          }
        });

      }
      else {
        res.render('message',{title:"Sorry",message:ename+" already exits in our family" , goto:"admin/addemp",
        gototitle:"Try again"})
      }
    });

});
router.get('/adminlogout',(req,res)=>{
  res.clearCookie('adminId');
  res.render('message',{
    title:"Success",
    message:"You have successfully logged out of Admin Control Panel",
    gototitle:"Continue on VJTI CARE ",
    goto:""
  })
});

module.exports = router;
