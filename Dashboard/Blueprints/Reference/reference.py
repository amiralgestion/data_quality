from flask import Blueprint, render_template

reference_bp = Blueprint('reference', __name__, template_folder='templates', static_folder='static')

@reference_bp.route('/')
def reference():
    return "Hello from reference blueprint"

@reference_bp.route('/content')
def load_content():
    return render_template('reference.html')