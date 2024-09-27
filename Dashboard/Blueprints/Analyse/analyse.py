from flask import Blueprint, render_template

analyse_bp = Blueprint('analyse', __name__, template_folder='templates', static_folder='static')

@analyse_bp.route('/')
def analyse():
    return "Hello from analyse blueprint"

@analyse_bp.route('/content')
def load_content():
    return render_template('analyse.html')