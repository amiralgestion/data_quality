# Installation
Instructions sur la façon d'installer et de configurer le projet.
1. **Configurer l'environnement :**
    - Créer un environnement virtuel :
      ```sh
      python -m venv env
      ```
    - Activer l'environnement virtuel :
      - Sur Windows :
        ```sh
        .\env\Scripts\activate
        ```
      - Sur Unix ou MacOS :
        ```sh
        source env/bin/activate
        ```
    - Installer les packages requis :
      ```sh
      pip install -r requirements.txt
      ```

2. **Configurer les variables d'environnement :**
    - Créer un fichier `.env` dans le répertoire racine du projet.
    - Ajouter les informations suivantes au fichier `.env` :
      ```
      ID=votre_id
      PASSWORD=votre_mot_de_passe
      SERVER=192.168.5.15
      SECRET_KEY=votre_clé_secrète
      ```

3. **Démarrer l'application :**
    - Exécuter la commande suivante :
      ```sh
      python app.py
      ```

