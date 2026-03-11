from flask import Flask, request, jsonify
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
import sqlite3
import storage as storage

app = Flask(__name__)
CORS(app)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    search_type = request.args.get('type', 'agents')
    user_rank = request.args.get('rank', 'rookie')
    rank_levels = {'rookie': 0, 'veteran': 1, 'elite': 2}
    user_level = rank_levels.get(user_rank, 0)
    entries = storage.search_database(query, search_type)
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
    user = storage.get_user(username, password)
    
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


@app.route('/create_user', methods=['POST'])
def create_user():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'User')
    rank = data.get('rank', 'rookie')
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required.'}), 400
    try:
        storage.insert_user(username, password, role, rank)
        return jsonify({'success': True, 'message': 'User created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_agent', methods=['POST'])
def create_agent():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    name = data.get('name')
    description = data.get('description', '')
    min_rank_required = data.get('min_rank_required', 'rookie')
    if not name:
        return jsonify({'success': False, 'message': 'Agent name required.'}), 400
    try:
        storage.insert_agent(name, description, min_rank_required)
        return jsonify({'success': True, 'message': 'Agent created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_location', methods=['POST'])
def create_location():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    name = data.get('name')
    description = data.get('description', '')
    min_rank_required = data.get('min_rank_required', 'rookie')
    if not name:
        return jsonify({'success': False, 'message': 'Location name required.'}), 400
    try:
        storage.insert_location(name, description, min_rank_required)
        return jsonify({'success': True, 'message': 'Location created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    
@app.route('/get_items', methods=['GET'])
def get_items():
    table = request.args.get('table')
    if not table:
        return jsonify({'success': False, 'message': 'Table parameter required.'}), 400
    try:
        if table == 'Users':
            users = storage.get_users()
            items = [
                {'user_id': u['user_id'], 'username': u['username'], 'role': u['role'], 'rank': u['rank']} for u in users
            ]
        elif table == 'Agents':
            agents = storage.get_agents()
            items = [
                {'agent_id': a['agent_id'], 'name': a['name'], 'description': a['description'], 'min_rank_required': a['min_rank_required']} for a in agents
            ]
        elif table == 'Locations':
            locations = storage.get_locations()
            items = [
                {'location_id': l['location_id'], 'name': l['name'], 'description': l['description'], 'min_rank_required': l['min_rank_required']} for l in locations
            ]
        else:
            return jsonify({'success': False, 'message': 'Unsupported table.'}), 400
        return jsonify({'success': True, 'items': items})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    
# Delete item endpoint
@app.route('/delete_item', methods=['POST'])
def delete_item():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    table = data.get('table')
    item_id = data.get('item_id')
    if not table or not item_id:
        return jsonify({'success': False, 'message': 'Table and item_id required.'}), 400
    try:
        storage.delete_item(table, item_id)
        return jsonify({'success': True, 'message': f'Item {item_id} deleted from {table}.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    
if __name__ == "__main__":
    
    app.run(debug=True)