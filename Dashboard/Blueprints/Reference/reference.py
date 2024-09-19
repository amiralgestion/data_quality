from flask import Blueprint, render_template

reference_bp = Blueprint('reference', __name__, template_folder='templates')

@reference_bp.route('/')
def reference():
    return "Hello from reference blueprint"