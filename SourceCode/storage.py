import sqlite3
import os

db_name = "database.db"


def initialise_database():
    conn = sqlite3.connect(db_name)
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
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Users (username, password, role, rank)
        VALUES (?, ?, ?, ?)
    ''', (username, password, role, rank))
    conn.commit()
    conn.close()

def insert_test_agent(name, description, min_rank_required):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Agents (name, description, min_rank_required)
        VALUES (?, ?, ?)
    ''', (name, description, min_rank_required))
    conn.commit()
    conn.close()

def insert_test_location(name, description, min_rank_required):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Locations (name, description, min_rank_required)
        VALUES (?, ?, ?)
    ''', (name, description, min_rank_required))
    conn.commit()
    conn.close()