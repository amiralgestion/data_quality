from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from flask_login import LoginManager
import os

app = Flask(__name__)
app.config.from_object(Config)
app.config.from_pyfile(
    os.path.join(os.path.dirname(app.root_path), 'config_server.py'),
    silent=True)

# Login settings
login = LoginManager(app)
login.login_view = 'login'
login.login_message = u"Veuillez vous connecter pour accéder à cette page."
login.login_message_category = "info"

# Create database connection object
db = SQLAlchemy(app)