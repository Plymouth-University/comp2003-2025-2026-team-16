import sqlite3
import psycopg2
import os
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def insert_user(username, password, role='User', rank='rookie'):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        INSERT INTO "Users" (username, password, role, rank)
        VALUES (%s, %s, %s, %s)
    ''', (username, password, role, rank))
    conn.commit()
    conn.close()

def insert_agent(name, description, min_rank_required):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        INSERT INTO "Agents" (name, description, min_rank_required)
        VALUES (%s, %s, %s)
    ''', (name, description, min_rank_required))
    conn.commit()
    conn.close()

def insert_location(name, description, min_rank_required):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        INSERT INTO "Locations" (name, description, min_rank_required)
        VALUES (%s, %s, %s)
    ''', (name, description, min_rank_required))
    conn.commit()
    conn.close()

# Universal delete function
def delete_item(table, item_id):

    allowed_tables = {
        'Users': 'user_id',
        'Agents': 'agent_id',
        'Locations': 'location_id',
        'Departments': 'department_id',
        'Archives': 'archive_id'
    }
    if table not in allowed_tables:
        raise ValueError('Invalid table name.')
    id_column = allowed_tables[table]
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(f"DELETE FROM {table} WHERE {id_column} = %s", (item_id,))
    conn.commit()
    conn.close()

# Fetch lists for admin panel
def get_users():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT user_id, username, role, rank FROM "Users"')
    users = cursor.fetchall()
    conn.close()
    return users

def get_agents():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT agent_id, name, description, min_rank_required FROM "Agents"')
    agents = cursor.fetchall()
    conn.close()
    return agents

def get_locations():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT location_id, name, description, min_rank_required FROM "Locations"')
    locations = cursor.fetchall()
    conn.close()
    return locations

def search_database(query, search_type):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    # (table_name, type_filter) — None means no type filter, search whole table
    table_map = {
        # Personnel
        'personnel':          ('Agents', None),
        'management':         ('Agents', 'management'),
        'field-agents':       ('Agents', 'field-agents'),
        'undercover-agents':  ('Agents', 'undercover-agents'),
        'departments':        ('Departments', None),
        # Intelligence
        'intelligence':       (None, None),
        'evidence':           (None, None),
        'factions':           ('Factions', None),
        'operatives':         ('Agents', 'operatives'),
        'suspects':           ('Suspects', None),
        'locations':          ('Locations', None),
        'technology':         (None, None),
        # Archive
        'archive':            ('Archive', None),
        'documents':          ('Archive', 'documents'),
        'completed-missions': ('Archive', 'completed-missions'),
        'archive-evidence':   ('Archive', 'archive-evidence'),
        'archive-misc':       ('Archive', 'archive-misc'),
        # Glossary
        'glossary':           ('Glossary', None),
    }
    mapping = table_map.get(search_type)
    if not mapping or mapping[0] is None:
        conn.close()
        return []
    table, type_filter = mapping
    if type_filter:
        cursor.execute(f'SELECT * FROM "{table}" WHERE name LIKE %s AND type = %s', ('%' + query + '%', type_filter))
    else:
        cursor.execute(f'SELECT * FROM "{table}" WHERE name LIKE %s', ('%' + query + '%',))
    entries = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return entries

def get_user(username, password):
    conn = get_connection()
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        SELECT username, rank, role FROM "Users" WHERE username = %s AND password = %s
    ''', (username, password))
    user = cursor.fetchone()
    conn.close()
    return user