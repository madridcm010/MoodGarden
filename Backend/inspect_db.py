import sqlite3

conn = sqlite3.connect("moodgarden.db")
cursor = conn.cursor()
import os
DB_PATH = r"C:\Users\Christian\Documents\moodgarden\MoodGarden\moodgarden.db"
print(">>> FASTAPI DB PATH:", os.path.abspath(DB_PATH))

print("\n=== TABLES ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())

print("\n=== RECOMMENDATIONS TABLE ===")
cursor.execute("PRAGMA table_info(recommendations);")
print(cursor.fetchall())

print("\n=== RESULTS TABLE ===")
cursor.execute("PRAGMA table_info(ai_results);")
print(cursor.fetchall())

print("\n=== USERS TABLE ===")
cursor.execute("PRAGMA table_info(users);")
print(cursor.fetchall())

conn.close()
