from flask import Blueprint, render_template

presence_bp = Blueprint('presence', __name__, template_folder='templates')

@presence_bp.route('/')
def presence():
    return "Hello from presence blueprint"