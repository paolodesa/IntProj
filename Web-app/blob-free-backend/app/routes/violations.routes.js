module.exports = app => {
    const violations = require("../controllers/violations.controller.js");
  
    var router = require("express").Router();
  
    // Retrieve all Detections
    router.get("/", violations.findAll);

    router.get("/getLastDay", violations.getLastDay)
  
    app.use('/api/violations', router);
  };