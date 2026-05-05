from flask import Flask, request, jsonify
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
import sqlite3
import secrets
import storage as storage
from agent import run_agent

app = Flask(__name__)
CORS(app)

# Server-side session store: token -> {username, role}
_sessions = {}

def _get_session_user():
    token = request.headers.get('X-Session-Token')
    if not token:
        return None
    return _sessions.get(token)

def _require_admin():
    user = _get_session_user()
    if not user or user.get('role') != 'Admin':
        return jsonify({'success': False, 'message': 'Admin access required.'}), 403
    return None

@app.route('/search')
def search():
    query = request.args.get('q', '')
    search_type = request.args.get('type', 'personnel')
    user_rank = request.args.get('rank', 'nester')
    rank_levels = {'nester': 0, 'hatchling': 1, 'chick': 2, 'fledgling': 3, 'wing commander': 4, 'squab leader': 5}
    user_level = rank_levels.get(user_rank, 0)
    entries = storage.search_database(query, search_type)
    filtered = []
    for entry in entries:
        min_rank = entry.get('min_rank_required', 'nester')
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
        token = secrets.token_hex(32)
        _sessions[token] = {'username': user['username'], 'role': user['role']}
        return jsonify({
            'success': True,
            'username': user['username'],
            'rank': user['rank'],
            'role': user['role'],
            'token': token
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username or password.'
        }), 401


@app.route('/create_user', methods=['POST'])
def create_user():
    err = _require_admin()
    if err:
        return err
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'User')
    rank = data.get('rank', 'nester')
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required.'}), 400
    try:
        storage.insert_user(username, password, role, rank)
        return jsonify({'success': True, 'message': 'User created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_agent', methods=['POST'])
def create_agent():
    err = _require_admin()
    if err:
        return err
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Agent name required.'}), 400
    try:
        storage.insert_agent(
            name=name,
            codename=data.get('codename', ''),
            type=data.get('type', 'field-agents'),
            faction=data.get('faction', ''),
            role=data.get('role', ''),
            counterpart=data.get('counterpart', ''),
            species=data.get('species', ''),
            overview=data.get('overview', ''),
            background_origins=data.get('background_origins', ''),
            symbolism_codename_meaning=data.get('symbolism_codename_meaning', ''),
            img=data.get('img', ''),
            min_rank_required=data.get('min_rank_required', 'nester')
        )
        return jsonify({'success': True, 'message': 'Agent created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_location', methods=['POST'])
def create_location():
    err = _require_admin()
    if err:
        return err
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    name = data.get('name')
    description = data.get('description', '')
    min_rank_required = data.get('min_rank_required', 'nester')
    if not name:
        return jsonify({'success': False, 'message': 'Location name required.'}), 400
    try:
        storage.insert_location(name, description, min_rank_required)
        return jsonify({'success': True, 'message': 'Location created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    
@app.route('/create_department', methods=['POST'])
def create_department():
    err = _require_admin()
    if err:
        return err
    data = request.get_json() if request.is_json else request.form
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Department name required.'}), 400
    try:
        storage.insert_department(name, data.get('description', ''), data.get('min_rank_required', 'nester'))
        return jsonify({'success': True, 'message': 'Department created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_faction', methods=['POST'])
def create_faction():
    err = _require_admin()
    if err:
        return err
    data = request.get_json() if request.is_json else request.form
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Faction name required.'}), 400
    try:
        storage.insert_faction(name, data.get('description', ''), data.get('min_rank_required', 'nester'))
        return jsonify({'success': True, 'message': 'Faction created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_suspect', methods=['POST'])
def create_suspect():
    err = _require_admin()
    if err:
        return err
    data = request.get_json() if request.is_json else request.form
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Suspect name required.'}), 400
    try:
        storage.insert_suspect(name, data.get('description', ''), data.get('min_rank_required', 'nester'))
        return jsonify({'success': True, 'message': 'Suspect created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_archive', methods=['POST'])
def create_archive():
    err = _require_admin()
    if err:
        return err
    data = request.get_json() if request.is_json else request.form
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Archive entry name required.'}), 400
    try:
        storage.insert_archive(name, data.get('description', ''), data.get('min_rank_required', 'nester'))
        return jsonify({'success': True, 'message': 'Archive entry created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/create_glossary', methods=['POST'])
def create_glossary():
    err = _require_admin()
    if err:
        return err
    data = request.get_json() if request.is_json else request.form
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Glossary entry name required.'}), 400
    try:
        storage.insert_glossary(name, data.get('description', ''), data.get('min_rank_required', 'nester'))
        return jsonify({'success': True, 'message': 'Glossary entry created successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/get_items', methods=['GET'])
def get_items():
    err = _require_admin()
    if err:
        return err
    table = request.args.get('table')
    allowed_tables = ['Users', 'Agents', 'Locations', 'Departments', 'Factions', 'Suspects', 'Archive', 'Glossary']
    if not table:
        return jsonify({'success': False, 'message': 'Table parameter required.'}), 400
    if table not in allowed_tables:
        return jsonify({'success': False, 'message': 'Unsupported table.'}), 400
    try:
        items = storage.get_all_items(table)
        return jsonify({'success': True, 'items': items})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    
# Delete item endpoint
@app.route('/delete_item', methods=['POST'])
def delete_item():
    err = _require_admin()
    if err:
        return err
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

@app.route('/agent', methods=['POST'])
def agent():
    data = request.get_json()
    message = data.get('message', '')

    response_text = run_agent(message)

    return jsonify({
        "response": response_text
    })

if __name__ == "__main__":
    
    app.run(debug=True)