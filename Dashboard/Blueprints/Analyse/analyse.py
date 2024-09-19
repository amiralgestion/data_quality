from flask import Blueprint, render_template

analyse_bp = Blueprint('analyse', __name__, template_folder='templates')

@analyse_bp.route('/')
def analyse():
    return "Hello from analyse blueprint"