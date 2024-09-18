import os
from urllib import parse
"""
Connection à la base de donnée
"""

class Config(object):
        ID = "user"
        PASSWORD = "*pwd"
        # SERVER = '192.168.2.31'
        SERVER = '192.168.5.15'
        SECRET_KEY = "secret_key"
        SQLALCHEMY_DATABASE_URI = 'mysql://{id}:{password}@{server}/Amiral_data?charset=utf8mb4'.format(id = ID, password = parse.quote(PASSWORD), server = SERVER)
        SQLALCHEMY_ECHO = False # Print SQL command
        SQLALCHEMY_TRACK_MODIFICATIONS = False
          # Récupération des différents chemin
        PROJECT_FOLDER = os.path.dirname(os.path.abspath(__file__))
        MAIN_APP_FOLDER = os.path.join(PROJECT_FOLDER, 'Dashboard')
        APP_JSON_CONFIG = os.path.join(MAIN_APP_FOLDER, 'json_config')
        PICTURES_FOLDER = os.path.join(MAIN_APP_FOLDER, 'static', 'img', 'Photos')