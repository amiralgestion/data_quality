from flask_login import UserMixin
from .extensions import db

class User(UserMixin, db.Model):
    __table_args__ = {'mysql_engine': 'InnoDB'}
    __tablename__ = 'user_risk'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, index=True, unique=True)
    password = db.Column(db.String(255))
    can_edit = db.Column(db.Boolean, unique=False, default=False)
    is_admin = db.Column(db.Boolean, unique=False, default=False)
    is_it = db.Column(db.Boolean, unique=False, default=False)
    is_analyste = db.Column(db.Boolean, unique=False, default=False)
    is_gerant_action = db.Column(db.Boolean, unique=False, default=False)
    is_gerant_obligation = db.Column(db.Boolean, unique=False, default=False)
    is_compliance = db.Column(db.Boolean, unique=False, default=False)
    is_middle = db.Column(db.Boolean, unique=False, default=False)
    is_commercial = db.Column(db.Boolean, unique=False, default=False)
    is_gp = db.Column(db.Boolean, unique=False, default=False)
    is_office_manager = db.Column(db.Boolean, unique=False, default=False)
    is_risques = db.Column(db.Boolean, unique=False, default=False)
    is_esg = db.Column(db.Boolean, unique=False, default=False)