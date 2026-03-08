import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")

def get_connection():
    return psycopg2.connect(DATABASE_URL)


def initialise_database():
    conn = get_connection()
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('User', 'Admin')),
            subscription_date DATE,
            rank TEXT NOT NULL DEFAULT 'rookie'
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Agents (
            agent_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            min_rank_required TEXT DEFAULT 'rookie'
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Locations (
            location_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            min_rank_required TEXT DEFAULT 'rookie'
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Departments (
            department_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            min_rank_required TEXT DEFAULT 'rookie'
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Archives (
            archive_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            agent_id INTEGER,
            location_id INTEGER,
            min_rank_required TEXT DEFAULT 'rookie',
            FOREIGN KEY(agent_id) REFERENCES Agents(agent_id),
            FOREIGN KEY(location_id) REFERENCES Locations(location_id)
        )
    ''')

    conn.commit()
    conn.close()

def insert_user(username, password, role='User', rank='rookie'):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Users (username, password, role, rank)
        VALUES (%s, %s, %s, %s)
    ''', (username, password, role, rank))
    conn.commit()
    conn.close()

def insert_agent(name, description, min_rank_required):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Agents (name, description, min_rank_required)
        VALUES (%s, %s, %s)
    ''', (name, description, min_rank_required))
    conn.commit()
    conn.close()

def insert_location(name, description, min_rank_required):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Locations (name, description, min_rank_required)
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
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table} WHERE {id_column} = %s", (item_id,))
    conn.commit()
    conn.close()

# Fetch lists for admin panel
def get_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, username, role, rank FROM Users")
    users = cursor.fetchall()
    conn.close()
    return users

def get_agents():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT agent_id, name, description, min_rank_required FROM Agents")
    agents = cursor.fetchall()
    conn.close()
    return agents

def get_locations():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location_id, name, description, min_rank_required FROM Locations")
    locations = cursor.fetchall()
    conn.close()
    return locations