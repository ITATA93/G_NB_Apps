#!/usr/bin/env python3
"""
NocoBase Blueprint Configurator
Reads app-spec/app.yaml and creates collections + fields via API
"""

import os
import sys
import yaml
import requests
from typing import Dict, List, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def build_field_payload(field_def: Dict[str, Any]) -> Dict[str, Any]:
    """Translate YAML field definition to NocoBase API payload"""
    
    field_type = field_def.get('type', 'string')
    field_name = field_def['name']
    
    # Base payload
    payload = {
        'name': field_name,
        'type': field_type,
    }
    
    # Map common types to NocoBase interface
    type_mapping = {
        'string': {'type': 'string', 'interface': None},
        'integer': {'type': 'integer', 'interface': 'integer'},
        'boolean': {'type': 'boolean', 'interface': 'checkbox'},
        'date': {'type': 'date', 'interface': 'date'},
        'datetime': {'type': 'datetime', 'interface': 'datetime'},
        'text': {'type': 'text', 'interface': 'textarea'},
        'belongsTo': {'type': 'belongsTo', 'interface': 'm2o'},
    }
    
    if field_type in type_mapping:
        payload.update(type_mapping[field_type])
    
    # Handle belongsTo relationships
    if field_type == 'belongsTo':
        payload['target'] = field_def.get('target')
        payload['foreignKey'] = field_def.get('foreignKey')
        if not payload.get('target'):
            print(f"  [WARN] belongsTo field {field_name} missing 'target'")
        if not payload.get('foreignKey'):
            print(f"  [WARN] belongsTo field {field_name} missing 'foreignKey'")
    
    # Build uiSchema
    ui_schema = field_def.get('uiSchema', {})
    
    # If no uiSchema provided, create basic one
    if not ui_schema:
        ui_schema = {
            'title': field_def.get('title', field_name.replace('_', ' ').title())
        }
        
        # Add component based on type
        if field_type == 'string':
            ui_schema['x-component'] = 'Input'
        elif field_type == 'integer':
            ui_schema['x-component'] = 'InputNumber'
        elif field_type == 'boolean':
            ui_schema['x-component'] = 'Checkbox'
        elif field_type == 'date':
            ui_schema['x-component'] = 'DatePicker'
        elif field_type == 'datetime':
            ui_schema['x-component'] = 'DatePicker'
            ui_schema['showTime'] = True
        elif field_type == 'text':
            ui_schema['x-component'] = 'Input.TextArea'
    
    payload['uiSchema'] = ui_schema
    
    # Handle required, unique, default
    if field_def.get('required'):
        payload['required'] = True
    if field_def.get('unique'):
        payload['unique'] = True
    if 'default' in field_def:
        payload['defaultValue'] = field_def['default']
    
    return payload


def create_collection(base_url: str, api_key: str, collection_def: Dict[str, Any]) -> bool:
    """Create a collection in NocoBase"""
    
    url = f"{base_url.rstrip('/')}/collections:create"
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'X-Role': 'root'
    }
    
    payload = {
        'name': collection_def['name'],
        'title': collection_def.get('title', collection_def['name']),
        'inherit': False,
        'hidden': False
    }
    
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        if resp.status_code == 200:
            print(f"[OK] Created collection: {collection_def['name']}")
            return True
        elif resp.status_code == 400:
            # Might already exist
            print(f"[WARN] Collection {collection_def['name']} might already exist (400)")
            return True
        else:
            print(f"[FAIL] Failed to create {collection_def['name']}: {resp.status_code}")
            print(resp.text)
            return False
    except Exception as e:
        print(f"[ERROR] Error creating {collection_def['name']}: {e}")
        return False


def create_field(base_url: str, api_key: str, collection_name: str, field_def: Dict[str, Any]) -> bool:
    """Create a field in a NocoBase collection"""
    
    url = f"{base_url.rstrip('/')}/collections/{collection_name}/fields:create"
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'X-Role': 'root'
    }
    
    payload = build_field_payload(field_def)
    
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        if resp.status_code == 200:
            print(f"  [OK] Created field: {field_def['name']}")
            return True
        else:
            print(f"  [FAIL] Failed to create field {field_def['name']}: {resp.status_code}")
            print(f"     Payload: {payload}")
            print(f"     Response: {resp.text}")
            return False
    except Exception as e:
        print(f"  [ERROR] Error creating field {field_def['name']}: {e}")
        return False


def main():
    # Load config
    base_url = os.getenv('NOCOBASE_BASE_URL', '').strip()
    api_key = os.getenv('NOCOBASE_API_KEY', '').strip()
    
    if not base_url or not api_key:
        print("ERROR: NOCOBASE_BASE_URL and NOCOBASE_API_KEY must be set")
        return 1
    
    # Load blueprint
    spec_path = 'app-spec/app.yaml'
    if not os.path.exists(spec_path):
        print(f"ERROR: {spec_path} not found")
        return 1
    
    with open(spec_path, 'r', encoding='utf-8') as f:
        spec = yaml.safe_load(f)
    
    collections = spec.get('data_model', {}).get('collections', [])
    
    if not collections:
        print("No collections found in blueprint")
        return 0
    
    print(f"\n>> Starting NocoBase configuration from blueprint...")
    print(f"   Collections to process: {len(collections)}\n")
    
    # Phase 1: Create all collections
    print("[*] Phase 1: Creating Collections")
    print("=" * 60)
    
    for coll in collections:
        create_collection(base_url, api_key, coll)
    
    # Phase 2: Create all fields
    print("\n[*] Phase 2: Creating Fields")
    print("=" * 60)
    
    for coll in collections:
        coll_name = coll['name']
        fields = coll.get('fields', [])
        
        if not fields:
            print(f"\n{coll_name}: No fields defined, skipping")
            continue
        
        print(f"\n{coll_name}: {len(fields)} field(s)")
        
        for field in fields:
            create_field(base_url, api_key, coll_name, field)
    
    print("\n[OK] Configuration complete!")
    return 0


if __name__ == '__main__':
    sys.exit(main())
