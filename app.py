import os
import logging
from Dashboard import app, logger

# Configurer les logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Supprimer les logs de werkzeug
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

if __name__ == "__main__":
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        logger.info("🚀 Starting Flask server...")
        logger.info("🌐 Running on http://127.0.0.1:5050")
        logger.info("🛠️ Press CTRL+C to quit")
        logger.info("🔄 Restarting with stat")
        logger.info("🐞 Debugger is active!")
        logger.info("🔑 Debugger PIN: 109-538-871")
        logger.info("\n")
    app.run(debug=True, port=5050)