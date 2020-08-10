const express   = require("express");
var mysql     = require("mysql");
const bodyParser= require("body-parser");

var connection = mysql.createConnection({
  host     : "localhost",
  user     : "root",
  password : "26580",
  database :"dbms" ,
  multipleStatements:true

});

connection.connect(function(err){
  if(!err){
    console.log("Connected to MYSQL Database.");
      }
  else {
    console.log("not connected to database");

  }
});

module.exports = connection ;
