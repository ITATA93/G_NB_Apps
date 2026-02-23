import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("NOCOBASE_BASE_URL")
API_KEY = os.getenv("NOCOBASE_API_KEY")

TARGET_TITLES = [
    "Casos",
    "Comité",
    "Agenda",
    "Actividades",
    "Personal",
    "Departamentos"
]

def get_routes():
    url = f"{BASE_URL}/desktopRoutes:list?pageSize=200"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json().get("data", [])

def main():
    routes = get_routes()
    found = {}
    
    print("Searching for routes...")
    for r in routes:
        if r['title'] in TARGET_TITLES:
            print(f"FOUND: {r['title']} -> ID: {r['id']}")
            found[r['title']] = r['id']
            
    # Also verify if they have schemaUid (needed for verification)
    
if __name__ == "__main__":
    main()
