from flask import Blueprint, render_template, jsonify, request
from ..utils import request_db
import logging  # Importer le module de journalisation

# Créer un Blueprint pour l'intégration
integration_bp = Blueprint('integration', __name__, template_folder='templates', static_folder='static')

# Route pour charger le contenu de la page d'intégration
@integration_bp.route('/content')
def load_content():
    return render_template('integration.html')

# Route pour récupérer les données d'intégration
@integration_bp.route('/data', methods=['GET'])
def fetch_data():
    # Récupérer les paramètres de requête startDate et endDate
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    # Valider la présence des deux dates
    if not start_date or not end_date:
        return jsonify({'error': 'Missing startDate or endDate'}), 400

    # Requête SQL
    query = """
            SELECT log_insertion_fiches_eval.* 
            FROM log_insertion_fiches_eval 
            INNER JOIN (
                SELECT id_ref_analyse_financiere, max(date_execution) AS max_date 
                FROM log_insertion_fiches_eval 
                GROUP BY id_ref_analyse_financiere
            ) AS filter 
            ON filter.id_ref_analyse_financiere = log_insertion_fiches_eval.id_ref_analyse_financiere 
            AND filter.max_date = log_insertion_fiches_eval.date_execution  
            WHERE date_execution >= :startDate
            AND date_execution <= :endDate
            ORDER BY log_insertion_fiches_eval.reussite DESC
            """
    
    params = {'startDate': start_date, 'endDate': end_date}

    try:
        # Exécuter la requête
        result = request_db(query, params)
        rows = result.fetchall()  # Récupérer tous les résultats de la requête

        # Initialiser les compteurs
        total_files = len(rows)
        success_count = sum(1 for row in rows if row.reussite == 1)
        impossible_count = sum(1 for row in rows if row.reussite == 0)

        return jsonify({
            'totalFiles': total_files,
            'successCount': success_count,
            'impossibleCount': impossible_count
        })
    except Exception as e:
        logging.error(f"Erreur lors de l'exécution de la requête : {e}")
        return jsonify({'error': str(e)}), 500