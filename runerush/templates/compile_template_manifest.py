#!/usr/bin/env python3
"""
RuneFlow Template Manifest Compiler
Compiles all 50 template IDs, names, descriptions, and metadata into a single JSON/YAML manifest.
"""

import json
import yaml
import os
import glob
from datetime import datetime
from pathlib import Path

def extract_template_metadata(file_path):
    """Extract metadata from a single template JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            template_data = json.load(f)
        
        # Get filename without extension as base ID
        filename = Path(file_path).stem
        
        # Extract metadata with fallbacks
        meta_runeflow = template_data.get('meta', {}).get('RuneFlow', {})
        
        # Template ID priority: filename -> meta.template_name -> root id -> root name
        template_id = filename
        if not template_id and meta_runeflow.get('template_name'):
            template_id = meta_runeflow.get('template_name')
        elif not template_id and template_data.get('id'):
            template_id = str(template_data.get('id'))
        elif not template_id and template_data.get('name'):
            template_id = template_data.get('name').replace(' ', '_')
        
        # Template name priority: meta.template_name -> root name -> filename
        template_name = meta_runeflow.get('template_name', '')
        if not template_name and template_data.get('name'):
            template_name = template_data.get('name')
        elif not template_name:
            template_name = filename.replace('_', ' ').replace('-', ' ').title()
        
        # Count nodes for additional metadata
        nodes_count = len(template_data.get('nodes', []))
        
        # Compile template metadata
        template_metadata = {
            'template_id': template_id,
            'template_name': template_name,
            'description': template_data.get('runeflow_description', ''),
            'category': meta_runeflow.get('category', ''),
            'provider': meta_runeflow.get('provider', 'RuneFlow'),
            'contact': meta_runeflow.get('contact', template_data.get('runeflow_contact', '')),
            'website': meta_runeflow.get('website', template_data.get('runeflow_website', '')),
            'tagline': template_data.get('runeflow_tagline', ''),
            'file_path': str(Path(file_path).relative_to(Path('.'))),
            'metadata': {
                'runeflow_category': template_data.get('runeflow_category', ''),
                'nodes_count': nodes_count,
                'has_credentials': any('credentials' in node for node in template_data.get('nodes', [])),
                'has_webhooks': any(node.get('type') == 'n8n-nodes-base.webhook' for node in template_data.get('nodes', [])),
                'has_manual_trigger': any(node.get('type') == 'n8n-nodes-base.manualTrigger' for node in template_data.get('nodes', [])),
                'has_ai_nodes': any('openai' in node.get('type', '').lower() or 'langchain' in node.get('type', '').lower() 
                                  for node in template_data.get('nodes', []))
            }
        }
        
        return template_metadata
        
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

def compile_manifest():
    """Compile all template metadata into a single manifest."""
    
    # Find all template JSON files
    template_files = glob.glob('./runerush-core-50-templates/*.json')
    template_files.sort()
    
    print(f"Found {len(template_files)} template files")
    
    # Extract metadata from all templates
    templates = []
    for file_path in template_files:
        print(f"Processing: {Path(file_path).name}")
        metadata = extract_template_metadata(file_path)
        if metadata:
            templates.append(metadata)
    
    # Create manifest structure
    manifest = {
        'manifest_info': {
            'version': '1.0',
            'created_date': datetime.now().strftime('%Y-%m-%d'),
            'total_templates': len(templates),
            'provider': 'RuneFlow',
            'description': 'Core bundle of RuneFlow automation templates for platform ingestion',
            'contact': 'bryan@runeflow.co',
            'website': 'https://runeflow.co',
            'tagline': 'Unlock the Power of Ancient Wisdom Through Modern Automation'
        },
        'templates': templates
    }
    
    # Validation
    print(f"\n=== MANIFEST VALIDATION ===")
    print(f"Expected templates: 50")
    print(f"Processed templates: {len(templates)}")
    print(f"Missing templates: {50 - len(templates) if len(templates) < 50 else 0}")
    
    # Category breakdown
    categories = {}
    for template in templates:
        category = template['category']
        categories[category] = categories.get(category, 0) + 1
    
    print(f"\n=== CATEGORY BREAKDOWN ===")
    for category, count in sorted(categories.items()):
        print(f"{category}: {count} templates")
    
    # Save as JSON
    json_file = './runeflow_core_50_templates_manifest.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"\n✅ JSON manifest saved: {json_file}")
    
    # Save as YAML
    yaml_file = './runeflow_core_50_templates_manifest.yaml'
    with open(yaml_file, 'w', encoding='utf-8') as f:
        yaml.dump(manifest, f, default_flow_style=False, allow_unicode=True, indent=2)
    print(f"✅ YAML manifest saved: {yaml_file}")
    
    return manifest

if __name__ == '__main__':
    manifest = compile_manifest()
    print(f"\n🎉 Template manifest compilation complete!")
    print(f"Total templates compiled: {len(manifest['templates'])}")
