const db = require("../models");
const Violations = db.violations;

// Retrieve all distance Violations from the database.
exports.findAll = (req, res) => {
    Violations.find({})
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

// Retrieve the number of distance Violations per hour in the last 24h from the database.
exports.getLastDay = (req, res) => {
  var yesterday = new Date(Date.now())
  yesterday.setHours(yesterday.getHours() + 1 - 23)
  yesterday.setMinutes(0, 0, 0)
  Violations.aggregate(
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
              count: { $sum: 1 },
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