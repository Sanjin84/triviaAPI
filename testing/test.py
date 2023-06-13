import os
import sys
from fastapi import Depends
from fastapi_jwt_auth import AuthJWT
from fastapi.testclient import TestClient
import pytest

# Append the parent directory of the root folder to the system path
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
# Set the working directory to the root folder
os.chdir(os.path.dirname(os.path.realpath(__file__)))

os.environ["TESTING"] = "True"
from main import app


client = TestClient(app)



def setup_module(module):
    os.environ["TESTING"] = "True"

def teardown_module(module):
    os.environ["TESTING"] = "False"


def test_read_main():
    response = client.get("/test")
    assert response.status_code == 200
    assert response.json() == {"message":"This is a test"}

def test_get_teams_table():
    response = client.get("/get_teams_table")
    assert response.status_code == 200
    assert response.json() is not None

def test_submit_answer():
    response = client.post("/submit_answer", 
                           json={"id": "1", 
                                 "answer": "a",
                                 "team_name": "Wantirna",
                                 "table": "teams"})
    assert response.status_code == 200
    assert response.json()["message"] == "Correct"
