from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

#Initialization of the script. Initializing authentication and SQLAlchemy objects
app = Flask(__name__, static_url_path = "")
app.config.from_object('config')
db = SQLAlchemy(app)

from app import restserver,models