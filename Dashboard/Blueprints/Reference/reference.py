from flask import Blueprint, render_template, jsonify, request
import logging
from ..utils import request_db

reference_bp = Blueprint('reference', __name__, template_folder='templates', static_folder='static')

@reference_bp.route('/')
def reference():
    return "Hello from reference blueprint"

@reference_bp.route('/content')
def load_content():
    return render_template('reference.html')

@reference_bp.route('/data')
def fetch_data():
    query = """
                SELECT 
                    *, (SELECT COUNT(*) 
                FROM 
                    ref_gerants_analystes) AS total_entries 
                FROM 
                    ref_gerants_analystes ORDER BY ref_gerants_analystes.id ASC;
            """
    try:
        result = request_db(query)
        row = result.fetchone()
        if not row:
            return jsonify({'error': 'No data found'}), 404
        
        total_entries = row.total_entries
        conform_data = []
        missing_data = []
        non_conform_data = []
        total = 0
        conform = 0
        missing = 0
        non_conform = 0

        while row:
            total += 1
            id = row.id
            prenom = row.prenom
            nom = row.nom
            nom_court_fiche_eval = row.nom_court_fiche_eval
            email = row.email
            if (nom_court_fiche_eval is None or len(nom_court_fiche_eval) >= 4):
                non_conform += 1
                non_conform_data.append({
                    'id': id,
                    'nom': nom,
                    'prenom': prenom,
                    'nom_court_fiche_eval': nom_court_fiche_eval,
                    'email': row.email,
                    'login_density': row.login_density,
                })
            else:
                if not isinstance(nom_court_fiche_eval, str):
                    non_conform += 1
                    non_conform_data.append({
                        'id': id,
                        'nom': nom,
                        'prenom': prenom,
                        'nom_court_fiche_eval': nom_court_fiche_eval,
                        'email': row.email,
                        'login_density': row.login_density,
                    })
                else:
                    if (isinstance(email, str) and isinstance(nom, str) and isinstance(prenom, str) and email != "" and nom != "" and prenom != "" and email is not None and nom is not None and prenom is not None):
                        conform += 1
                        conform_data.append({
                            'id': id,
                            'nom': nom,
                            'prenom': prenom,
                            'nom_court_fiche_eval': nom_court_fiche_eval,
                            'email': row.email,
                            'login_density': row.login_density,
                        })
                    else:
                        missing += 1
                        missing_data.append({
                            'id': id,
                            'nom': nom,
                            'prenom': prenom,
                            'nom_court_fiche_eval': nom_court_fiche_eval,
                            'email': row.email,
                            'login_density': row.login_density,
                        })

            row = result.fetchone()

        return jsonify({
            'total_entries': total_entries,
            'conform_data': conform_data,
            'missing_data': missing_data,
            'non_conform_data': non_conform_data
        })
    except Exception as e:
        logging.error(f"Erreur lors de l'exécution de la requête : {e}")
        return jsonify({'error': str(e)}), 500

@reference_bp.route('/update', methods=['POST'])
def update_data():
    data = request.json
    try:
        id = data['id']
        prenom = data['prenom']
        nom = data['nom']
        nom_court_fiche_eval = data['nom_court_fiche_eval']
        email = data['email']

        prenom = prenom if prenom != "" else None
        nom = nom if nom != "" else None
        email = email if email != "" else None

        query = """
            UPDATE ref_gerants_analystes
            SET prenom = :prenom, nom = :nom, nom_court_fiche_eval = :nom_court_fiche_eval, email = :email
            WHERE id = :id
        """
        params = {
            'prenom': prenom,
            'nom': nom,
            'nom_court_fiche_eval': nom_court_fiche_eval,
            'email': email,
            'id': id
        }
        request_db(query, params)

        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Erreur lors de la mise à jour des données : {e}")
        return jsonify({'error': str(e)}), 500

@reference_bp.route('/delete', methods=['POST'])
def delete_data():
    data = request.json
    try:
        id = data['id']

        query = "DELETE FROM ref_gerants_analystes WHERE id = :id"
        params = {'id': id}
        request_db(query, params)

        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Erreur lors de la suppression des données : {e}")
        return jsonify({'error': str(e)}), 500