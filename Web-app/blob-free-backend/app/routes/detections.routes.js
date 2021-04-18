module.exports = app => {
    const detections = require("../controllers/detections.controller.js");
  
    var router = require("express").Router();
  
    // Retrieve all Detections
    router.get("/", detections.findAll);

    router.get("/getLastDay", detections.getLastDay)

    router.get("/getPercMask", detections.getPercMask)
  
    app.use('/api/detections', router);
  };