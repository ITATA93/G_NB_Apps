import os
import random
import string
import requests
import json
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("NOCOBASE_BASE_URL")
API_KEY = os.getenv("NOCOBASE_API_KEY")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "X-Role": "root"
}

def uid(length=11):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def get_client(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}".replace("//", "/")
    resp = requests.get(url, headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()

def post_client(endpoint, data):
    url = f"{BASE_URL}/{endpoint}".replace("//", "/")
    resp = requests.post(url, headers=HEADERS, json=data)
    if resp.status_code >= 400:
        print(f"Error POST {endpoint}: {resp.text}")
    resp.raise_for_status()
    return resp.json()

def create_table_block(collection_name):
    row_uid = uid()
    col_uid = uid()
    card_uid = uid()
    actions_uid = uid()
    table_uid = uid()

    return {
        "type": "void",
        "x-component": "Grid.Row",
        "x-uid": row_uid,
        "properties": {
            col_uid: {
                "type": "void",
                "x-component": "Grid.Col",
                "x-uid": col_uid,
                "properties": {
                    card_uid: {
                        "type": "void",
                        "x-decorator": "TableBlockProvider",
                        "x-decorator-props": {
                            "collection": collection_name,
                            "resource": collection_name,
                            "action": "list",
                            "params": {"pageSize": 20}
                        },
                        "x-component": "CardItem",
                        "x-uid": card_uid,
                        "properties": {
                            actions_uid: {
                                "type": "void",
                                "x-component": "ActionBar",
                                "x-uid": actions_uid,
                                "x-component-props": {"style": {"marginBottom": 16}},
                                "properties": {}
                            },
                            table_uid: {
                                "type": "array",
                                "x-component": "TableV2",
                                "x-uid": table_uid,
                                "x-component-props": {
                                    "rowKey": "id",
                                    "rowSelection": {"type": "checkbox"}
                                },
                                "properties": {}
                            }
                        }
                    }
                }
            }
        }
    }

def add_block_to_page(page_id, collection_name):
    print(f"Adding block to page {page_id} for collection {collection_name}...")
    try:
        # 1. Get Page Schema UID
        route_data = get_client("desktopRoutes:get", {"filterByTk": page_id})
        schema_uid = route_data['data']['schemaUid']
        
        # 2. Get Grid UID
        page_props = get_client(f"uiSchemas:getProperties/{schema_uid}")
        props = page_props.get('data', {}).get('properties', {})
        if not props:
            print("No properties found in page schema")
            return
            
        grid_key = list(props.keys())[0]
        grid_uid = props[grid_key]['x-uid']
        
        # 3. Create Block
        block = create_table_block(collection_name)
        
        # 4. Insert
        post_client(f"uiSchemas:insertAdjacent/{grid_uid}?position=beforeEnd", {"schema": block})
        print("Success!")
        
    except Exception as e:
        print(f"Failed to add block: {e}")

def create_role(name, title):
    print(f"Creating role {name} ({title})...")
    try:
        post_client("roles:create", {"name": name, "title": title})
        print("Success!")
    except Exception as e:
        print(f"Failed (or exists): {e}")

def grant_permissions(role, collection, actions):
    print(f"Granting {role} on {collection} [{','.join(actions)}]...")
    action_objs = [{"name": a, "fields": []} for a in actions]
    try:
        # Try update first (if exists)
        try:
            res_list = get_client(f"roles/{role}/resources:list", {"filter": {"name": collection}})
            if res_list.get('data'):
                # Update
                post_client(f"roles/{role}/resources:update", {
                    "filterByTk": res_list['data'][0]['name'],
                    "usingActionsConfig": True,
                    "actions": action_objs
                })
                print("Updated!")
                return
        except:
            pass
            
        # Create
        post_client(f"roles/{role}/resources:create", {
            "name": collection,
            "usingActionsConfig": True,
            "actions": action_objs
        })
        print("Created!")
    except Exception as e:
        print(f"Failed to grant: {e}")

def main():
    # PAGE IDs (from previous step)
    pages = {
        "onco_casos": 346483314196484,
        "onco_comite_sesiones": 346483314196487,
        "schedule_blocks": 346483316293635,
        "activity_types": 346483316293638,
        "staff": 346483316293643,
        "departments": 346483316293646
    }
    
    # 1. Add Blocks
    for coll, pid in pages.items():
        add_block_to_page(pid, coll)
        
    # 2. Create Roles
    create_role("admin_clinico", "Administrador Clínico")
    create_role("medico_onco", "Médico Oncólogo")
    create_role("coord_pabellon", "Coordinador Pabellón")
    
    # 3. Grant Permissions
    # Admin Clinico
    grant_permissions("admin_clinico", "staff", ["list", "create", "update", "view"])
    grant_permissions("admin_clinico", "onco_casos", ["list", "create", "update", "view"])
    grant_permissions("admin_clinico", "schedule_blocks", ["list", "create", "update", "view", "destroy"])
    
    # Medico Onco
    grant_permissions("medico_onco", "onco_casos", ["list", "view", "update"])
    grant_permissions("medico_onco", "onco_episodios", ["list", "create", "view"])
    grant_permissions("medico_onco", "onco_comite_sesiones", ["list", "view"])
    
    # Coord Pabellon
    grant_permissions("coord_pabellon", "schedule_blocks", ["list", "create", "update", "view"])
    grant_permissions("coord_pabellon", "activity_blocks", ["list", "view"])
    grant_permissions("coord_pabellon", "staff", ["list", "view"])

if __name__ == "__main__":
    main()
