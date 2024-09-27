from flask import Blueprint, render_template

presence_bp = Blueprint('presence', __name__, template_folder='templates', static_folder='static')

@presence_bp.route('/')
def presence():
    return "Hello from presence blueprint"

@presence_bp.route('/content')
def load_content():
    return render_template('presence.html')