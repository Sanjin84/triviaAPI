import os
import sqlite3
import json
import random


def random_color():
    # return a random color in hex, make the brightness of each color > 120
    r = random.randint(80, 255)
    g = random.randint(80, 255)
    b = random.randint(80, 255)
    return f"#{r:02x}{g:02x}{b:02x}"


if os.path.exists('comp.db'):
    os.remove('comp.db')
    print("Database deleted and recreated")
else:
    print("Database created")

conn = sqlite3.connect('comp.db')
c = conn.cursor()


c.execute('''
    CREATE TABLE questions(
          id text, 
          content text, 
          answer text, 
          points integer
          )
''')

# add the questions to the database by reading the questions.json file
with open('comp_questions.json') as f:
    questions = json.load(f)

for q in questions:
    print(q)
    print(q['id'], q['answer'], q['points'])
    c.execute("INSERT INTO questions VALUES (?, ?, ?, ?)", (q['id'], q['question'], q['answer'], q['points']))

c.execute('''
    CREATE TABLE teams(
        name text, 
        ip text,
        score integer, 
        attempted_questions integer,
        solved_questions integer, 
        color text
    )
''')

c.execute('''
    CREATE TABLE attempted_questions (
        team_name text,
        ip text,
        question_id text, 
        timestamp datetime,
        solved boolean,
        FOREIGN KEY(team_name) REFERENCES teams(name),
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )
''')

teams = ['GitTest', "test2", "test3"]
from random import randint
for team in teams:
    ip = str(randint(0,255)) +','+str(randint(0,255)) +','+str(randint(0,255)) +','+str(randint(0,255))
    score = randint(5,10)*10
    c.execute("INSERT INTO teams VALUES (?, ?, ?, ?, ?, ?)", (team, ip, score, 10, 5, random_color()))

conn.commit()
conn.close()

print('Database created successfully')
