from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import storage

app = Flask(__name__)
CORS(app)
def search_database(query, search_type):
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    table_map = {
        'agents': 'Agents',
        'locations': 'Locations',
        'departments': 'Departments',
        'archives': 'Archives'
    }
    table = table_map.get(search_type, 'Agents')
    cursor.execute(f"SELECT * FROM {table} WHERE name LIKE ?", ('%' + query + '%',))
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

@app.route('/search')
def search():
    query = request.args.get('q', '')
    search_type = request.args.get('type', 'agents')
    results = search_database(query, search_type)
    return jsonify(results)

if __name__ == "__main__":
    storage.initialise_database()
    app.run(debug=True)