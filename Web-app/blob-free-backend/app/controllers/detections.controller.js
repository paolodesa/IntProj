const db = require("../models");
const Detections = db.detections;

// Retrieve all Detections from the database.
exports.findAll = (req, res) => {
    Detections.find({})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving detections."
        });
      });
  };

// Retrieve the number of Detections per hour in the last 24h from the database.
exports.getLastDay = (req, res) => {
  var yesterday = new Date(Date.now())
  yesterday.setHours(yesterday.getHours() + 2 - 23)
  yesterday.setMinutes(0, 0, 0)
  Detections.aggregate(
    [
      {
          $match: { "timestamp": { $gte: yesterday } }
      },
      {
          $group: {
              _id: {
                  h: { $hour: "$timestamp" },
                  d: { $dayOfMonth: "$timestamp" } ,
                  m: { $month: "$timestamp" } ,
                  y: { $year: "$timestamp" } ,
              },
              tot_count: { $sum: 1 },
              no_mask_count: {
                  "$sum": {
                      "$cond": [
                          { "$eq": [
                              "$mask", false
                          ]},
                          1,
                          0
                      ]
                  }
              }
          }
      },
      {
          $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1, "_id.h": 1 }
      }
    ]
  )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving detections."
      });
    });
};

// Retrieve the number of Detections in the last 24h from the database.
exports.getPercMask = (req, res) => {
  var yesterday = new Date(Date.now())
  yesterday.setHours(yesterday.getHours() + 2 - 23)
  Detections.aggregate(
    [
      {
          $match: { "timestamp": { $gte: yesterday } }
      },
      {
          $group: {
              _id: 1,
              mask_count: {
                  "$sum": {
                      "$cond": [
                          { "$eq": [
                              "$mask", true
                          ]},
                          1,
                          0
                      ]
                  }
              },
              no_mask_count: {
                  "$sum": {
                      "$cond": [
                          { "$eq": [
                              "$mask", false
                          ]},
                          1,
                          0
                      ]
                  }
              }
          }
      },
    ]
  )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving detections."
      });
    });
};