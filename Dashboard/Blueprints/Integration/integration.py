from flask import Blueprint, render_template, jsonify, request, send_file
import os
from ..utils import request_db
import logging
from urllib.parse import unquote

# Créer un Blueprint pour l'intégration
integration_bp = Blueprint('integration', __name__, template_folder='templates', static_folder='static')

# Route pour charger le contenu de la page d'intégration
@integration_bp.route('/content')
def load_content():
    return render_template('integration.html')

# Route pour récupérer les données d'intégration
@integration_bp.route('/data', methods=['GET'])
def fetch_data():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
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

# Route pour récupérer les fichiers d'intégration
@integration_bp.route('/files', methods=['GET'])
def fetch_files():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
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

        # Initialiser les listes pour les fichiers
        impossible_files = []
        success_files = []
        error_files = []

        for row in rows:
            filename = os.path.basename(row.chemin)
            if row.reussite == 0:
                impossible_files.append(filename)
            elif row.reussite == 1:
                success_files.append(filename)

        impossible_files.sort()
        success_files.sort()
        error_files.sort()
        
        print("Taille impossible_files : ", len(impossible_files))
        print("Taille success_files : ", len(success_files))
        print("Taille error_files : ", len(error_files))
        return jsonify({
            'impossibleFiles': impossible_files,
            'successFiles': success_files,
            'errorFiles': error_files
        })
    except Exception as e:
        logging.error(f"Erreur lors de l'exécution de la requête : {e}")
        return jsonify({'error': str(e)}), 500

# Route pour récupérer les détails d'un fichier
@integration_bp.route('/file-details', methods=['GET'])
def fetch_file_details():
    file_name = request.args.get('fileName')
    
    if not file_name:
        return jsonify({'error': 'Missing fileName'}), 400

    query = """
        SELECT 
            log.id_log, log.id_ref_analyse_financiere, log.societe, log.chemin, log.date_execution, log.reussite, log.etat, log.commentaire,
            ref.ticker, ref.name, ref.id_gerant1, ref.id_gerant2,
            g1.nom AS gerant1_nom, g1.prenom AS gerant1_prenom, g1.nom_court_fiche_eval AS gerant1_nom_court,
            g2.nom AS gerant2_nom, g2.prenom AS gerant2_prenom, g2.nom_court_fiche_eval AS gerant2_nom_court
        FROM log_insertion_fiches_eval log
        LEFT JOIN ref_data_analyse_financiere ref ON log.id_ref_analyse_financiere = ref.id_ref_data_analyse_financiere
        LEFT JOIN ref_gerants_analystes g1 ON ref.id_gerant1 = g1.id
        LEFT JOIN ref_gerants_analystes g2 ON ref.id_gerant2 = g2.id
        WHERE log.chemin LIKE :fileName
    """
    
    params = {'fileName': f"%{file_name}%"}
    
    try:
        result = request_db(query, params)
        row = result.fetchone()
        
        if not row:
            return jsonify({'error': 'File not found'}), 404
        
        gerants = []
        if row.gerant1_prenom and row.gerant1_nom:
            gerants.append(f"{row.gerant1_prenom} {row.gerant1_nom}")
        if row.gerant2_prenom and row.gerant2_nom:
            gerants.append(f"{row.gerant2_prenom} {row.gerant2_nom}")
        
        if not gerants:
            gerants.append(row.gerant1_nom_court or row.gerant2_nom_court)
        
        return jsonify({
            'fileName': os.path.basename(row.chemin),
            'gerants': gerants,
            'ticker': row.ticker,
            'etat': row.etat,
            'commentaire': row.commentaire,
            'chemin' : row.chemin,
            'societe': row.societe,
        })
    except Exception as e:
        logging.error(f"Erreur lors de l'exécution de la requête : {e}")
        return jsonify({'error': str(e)}), 500

# Fonction pour get le directory des partages
def find_partages_directory():
    current_dir = os.getcwd()
    while current_dir != '/':
        potential_partages = os.path.join(current_dir, 'Partages')
        if os.path.exists(potential_partages) and os.path.isdir(potential_partages):
            return potential_partages
        current_dir = os.path.dirname(current_dir)
    return None

# Route pour télécharger un fichier
@integration_bp.route('/download-file', methods=['GET'])
def download_file():
    file_path = request.args.get('filePath')

    if not file_path:
        return jsonify({'error': 'Missing filePath'}), 400

    partages_base_path = find_partages_directory()
    if not partages_base_path:
        return jsonify({'error': 'Partages directory not found'}), 500

    # Normaliser le chemin du fichier
    if file_path.startswith('P:/'):
        file_path = file_path[3:]  # Enlever le 'P:/' du chemin
        full_path = os.path.join(partages_base_path, file_path)
    elif file_path.startswith('/Partages/'):
        full_path = os.path.join(partages_base_path, file_path.lstrip('/Partages/'))
    else:
        return jsonify({'error': 'Invalid file path format'}), 400

    absolute_path = os.path.abspath(full_path)
    if not os.path.exists(absolute_path):
        print("File not found at path: ", absolute_path)
        return jsonify({'error': 'File not found'}), 404

    file_name = os.path.basename(file_path)
    return send_file(absolute_path, as_attachment=True, download_name=file_name)