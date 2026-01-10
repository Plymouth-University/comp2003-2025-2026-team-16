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
    entries = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return entries

@app.route('/search')
def search():
    query = request.args.get('q', '')
    search_type = request.args.get('type', 'agents')
    user_rank = request.args.get('rank', 'rookie')
    rank_levels = {'rookie': 0, 'veteran': 1, 'elite': 2}
    user_level = rank_levels.get(user_rank, 0)
    entries = search_database(query, search_type)
    filtered = []
    for entry in entries:
        min_rank = entry.get('min_rank_required', 'rookie')
        entry_level = rank_levels.get(min_rank, 0)
        if user_level >= entry_level:
            filtered.append(entry)
        else:
            # Optionally, show a locked message for restricted entries
            filtered.append({
                'name': entry.get('name', entry.get('title', 'Locked')),
                'description': 'Access denied: Your rank is too low to view this entry.',
                'locked': True
            })
    return jsonify(filtered)


# Login route for authentication
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT username, rank, role FROM Users WHERE username = ? AND password = ?
    ''', (username, password))
    user = cursor.fetchone()
    conn.close()
    if user:
        return jsonify({
            'success': True,
            'username': user['username'],
            'rank': user['rank'],
            'role': user['role']
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username or password.'
        }), 401

if __name__ == "__main__":
    storage.initialise_database()
    app.run(debug=True)