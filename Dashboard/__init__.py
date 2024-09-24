import logging
from flask import Flask, redirect, url_for, request, jsonify
from config import Config
from .extensions import db, login_manager
from .models import User
from .Blueprints import analyse_bp, integration_bp, presence_bp, reference_bp, home_bp
import os
from datetime import datetime

# Configurer les logs
logging.basicConfig(level=logging.INFO, format='%(message)s', handlers=[logging.StreamHandler()])
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)
app.config.from_pyfile(
    os.path.join(os.path.dirname(app.root_path), 'config_server.py'),
    silent=True)

# Initialisation de la base de données
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = u"Veuillez vous connecter pour accéder à cette page."
login_manager.login_message_category = "info"

# Définir la fonction de chargement de l'utilisateur
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Enregistrer les blueprints
app.register_blueprint(home_bp, url_prefix='/home')
app.register_blueprint(analyse_bp, url_prefix='/analyse')
app.register_blueprint(integration_bp, url_prefix='/integration')
app.register_blueprint(presence_bp, url_prefix='/presence')
app.register_blueprint(reference_bp, url_prefix='/reference')

# Logger les informations de la requête
@app.after_request
def log_response_info(response):
    blueprint = request.blueprint if request.blueprint else "No Blueprint"
    method = request.method
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = (
        f"🕒 Timestamp: {timestamp}\n"
        f"🌐 Remote Address: {request.remote_addr}\n"
        f"📄 Request: \"{request.method} {request.path} {request.scheme}/{request.environ.get('SERVER_PROTOCOL')}\"\n"
        f"📊 Status Code: {response.status_code}\n"
        f"📂 Path: {request.path}\n"
        f"🛤️ Route: {request.endpoint}\n"
        f"🌐 URL: {request.url}\n"
        f"🔖 Blueprint: {blueprint}\n"
        f"🔍 Method: {method}\n"
        "----------------------------------------"
    )
    logger.info(log_entry)
    return response

# Rediriger vers la page d'accueil
@app.route('/')
def home():
    return redirect(url_for('home.home'))