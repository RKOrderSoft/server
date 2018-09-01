import sqlite3
import csv

fields = "orderId,dishes,notes,timeSubmitted,timeCompleted,timePaid,serverId,tableNumber,amtPaid"
aa = sqlite3.connect("./db.sqlite")
db = aa.cursor()

with open("data-orders.csv") as f:
	reader = csv.reader(f)
	db.executemany("INSERT INTO orders (" + fields + ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", reader)
aa.commit()