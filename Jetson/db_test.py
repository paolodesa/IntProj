import pymongo
import datetime
import time

myclient = pymongo.MongoClient("mongodb://10.0.0.24:27017/")
db = myclient["blob-free"]
detections = db["detections"]
violations = db["dist_violations"]

det = { "mask": True, "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=0)) }

#x = detections.insert_one(det)

violations.insert_one({ "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=7)) })