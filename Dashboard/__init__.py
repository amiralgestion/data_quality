from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from flask_login import LoginManager
from .Blueprints import analyse_bp, integration_bp, presence_bp, reference_bp, index_bp
import os

app = Flask(__name__)
app.config.from_object(Config)
app.config.from_pyfile(
    os.path.join(os.path.dirname(app.root_path), 'config_server.py'),
    silent=True)

# Paramétrage de la session
login = LoginManager(app)
login.login_view = 'login'
login.login_message = u"Veuillez vous connecter pour accéder à cette page."
login.login_message_category = "info"

# Créer la connexion à la base de donnée
db = SQLAlchemy(app)

# Enregistrer les blueprints
app.register_blueprint(index_bp)
app.register_blueprint(analyse_bp, url_prefix='/analyse')
app.register_blueprint(integration_bp, url_prefix='/integration')
app.register_blueprint(presence_bp, url_prefix='/presence')
app.register_blueprint(reference_bp, url_prefix='/reference')