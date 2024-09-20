from flask import Blueprint, render_template, redirect, url_for

home_bp = Blueprint('home', __name__, template_folder='templates', static_folder='static')

@home_bp.route('/')
def home():
    return render_template('home.html')