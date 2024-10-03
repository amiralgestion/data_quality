import os
from urllib import parse
from dotenv import load_dotenv

load_dotenv()

"""
Connection à la base de donnée
"""

class Config(object):
    ID = os.getenv("ID")
    PASSWORD = os.getenv("PASSWORD")
    SERVER = os.getenv("SERVER") #192.168.5.15
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = 'mysql://{id}:{password}@{server}/Amiral_data?charset=utf8mb4'.format(
        id=ID, password=parse.quote(PASSWORD), server=SERVER)
    SQLALCHEMY_ECHO = False  # Afficher les commandes SQL
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Suivre les modifications des objets SQLAlchemy

    # Récupération des différents chemins
    PROJECT_FOLDER = os.path.dirname(os.path.abspath(__file__))
    MAIN_APP_FOLDER = os.path.join(PROJECT_FOLDER, 'Dashboard')
    APP_JSON_CONFIG = os.path.join(MAIN_APP_FOLDER, 'json_config')