from flask import Flask
from config import Config
from .extensions import db, login_manager
from .models import User
from .Blueprints import analyse_bp, integration_bp, presence_bp, reference_bp, index_bp
import os

app = Flask(__name__)
app.config.from_object(Config)
app.config.from_pyfile(
    os.path.join(os.path.dirname(app.root_path), 'config_server.py'),
    silent=True)

# Initialize extensions
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = u"Veuillez vous connecter pour accéder à cette page."
login_manager.login_message_category = "info"

# Define user_loader function
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register blueprints
app.register_blueprint(index_bp)
app.register_blueprint(analyse_bp, url_prefix='/analyse')
app.register_blueprint(integration_bp, url_prefix='/integration')
app.register_blueprint(presence_bp, url_prefix='/presence')
app.register_blueprint(reference_bp, url_prefix='/reference')

# Create the database
with app.app_context():
    db.create_all()