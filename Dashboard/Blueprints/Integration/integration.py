from flask import Blueprint, render_template

integration_bp = Blueprint('integration', __name__, template_folder='templates', static_folder='static')

@integration_bp.route('/')
def integration():
    return "Hello from integration blueprint"