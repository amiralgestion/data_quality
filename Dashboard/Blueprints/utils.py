from sqlalchemy import text
from ..extensions import db

def request_db(sql_request, params=None):
    with db.engine.connect() as connection:
        transaction = connection.begin()
        try:
            result = connection.execute(text(sql_request), params)
            transaction.commit()
        except Exception as e:
            transaction.rollback()
            raise e
    return result