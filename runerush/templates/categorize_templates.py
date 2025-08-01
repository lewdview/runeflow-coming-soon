#!/usr/bin/env python3
"""
Script to categorize RuneFlow templates into Core and Pro collections.

Core: Basic, essential workflows (50-100 templates)
Pro: Advanced, complex workflows (remaining templates)
"""

import json
import os
import glob
import shutil
import re
from datetime import datetime

def analyze_template_complexity(file_path):
    """Analyze template complexity and return categorization info."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Get basic info
        nodes = data.get('nodes', [])
        functional_nodes = [node for node in nodes if node.get('name') != '🔥 RuneFlow Template']
        node_count = len(functional_nodes)
        
        # Get metadata if available
        meta = data.get('runeflow_meta', {})
        quality_score = meta.get('quality_score', 5)
        has_credentials = meta.get('has_credentials', False)
        has_webhooks = meta.get('has_webhooks', False)
        has_ai_nodes = meta.get('has_ai_nodes', False)
        
        # Analyze node types
        node_types = [node.get('type', '') for node in functional_nodes]
        
        # Count advanced features
        advanced_features = 0
        
        # AI-related features
        if has_ai_nodes or any('openai' in node_type.lower() for node_type in node_types):
            advanced_features += 2
        
        # Database operations
        if any(db in node_type.lower() for db in ['mysql', 'postgres', 'mongodb'] for node_type in node_types):
            advanced_features += 1
        
        # Complex integrations
        if has_credentials:
            advanced_features += 1
        
        # Multiple communication channels
        comm_nodes = sum(1 for node_type in node_types if any(comm in node_type.lower() 
                        for comm in ['slack', 'telegram', 'gmail', 'mattermost', 'discord']))
        if comm_nodes > 1:
            advanced_features += 1
        
        # File operations
        if any('file' in node_type.lower() for node_type in node_types):
            advanced_features += 1
        
        # Complex processing nodes
        complex_nodes = ['code', 'function', 'switch', 'merge', 'splitInBatches']
        if any(complex_node in node_type for node_type in node_types for complex_node in complex_nodes):
            advanced_features += 1
        
        # Calculate complexity score
        complexity_score = (node_count * 0.5) + (advanced_features * 2) + (quality_score * 0.5)
        
        return {
            'node_count': node_count,
            'quality_score': quality_score,
            'advanced_features': advanced_features,
            'complexity_score': complexity_score,
            'has_ai': has_ai_nodes,
            'has_credentials': has_credentials,
            'has_webhooks': has_webhooks,
            'node_types': node_types
        }
        
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return None

def categorize_template(analysis, filename):
    """Categorize template as Core or Pro based on analysis."""
    if not analysis:
        return 'pro'  # Default to pro if analysis fails
    
    # Core criteria (simpler templates)
    core_criteria = [
        analysis['node_count'] <= 8,  # Simple workflows
        analysis['complexity_score'] <= 15,  # Low complexity
        not analysis['has_ai'],  # No AI features
        analysis['advanced_features'] <= 2,  # Few advanced features
        analysis['quality_score'] >= 7  # Good quality
    ]
    
    # Essential workflow patterns for Core
    essential_patterns = [
        'webhook_data_processing',
        'scheduled_api_data_fetcher',
        'manual_data_processing',
        'slack_notification',
        'gmail_email_processing',
        'google_sheets_update',
        'database_management',
        'general_purpose'
    ]
    
    filename_lower = filename.lower()
    is_essential = any(pattern in filename_lower for pattern in essential_patterns)
    
    # Simple notification/communication workflows
    simple_patterns = [
        'notification',
        'alert',
        'send_message',
        'post_to',
        'sync_data',
        'backup'
    ]
    is_simple = any(pattern in filename_lower for pattern in simple_patterns)
    
    # Decide category
    if sum(core_criteria) >= 3 and (is_essential or is_simple):
        return 'core'
    elif analysis['node_count'] <= 5 and not analysis['has_ai'] and analysis['quality_score'] >= 8:
        return 'core'
    else:
        return 'pro'

def create_collections():
    """Create Core and Pro collections from numbered templates."""
    # Create directories
    os.makedirs('runeflow_core_collection', exist_ok=True)
    os.makedirs('runeflow_pro_collection', exist_ok=True)
    
    # Get all numbered templates
    template_files = glob.glob('runeflow_numbered_templates/RuneFlow_Rune_*.json')
    template_files.sort()
    
    core_templates = []
    pro_templates = []
    
    print(f"Analyzing {len(template_files)} templates...")
    print("-" * 60)
    
    for i, file_path in enumerate(template_files):
        filename = os.path.basename(file_path)
        
        # Extract Rune number
        rune_match = re.search(r'Rune_(\d{4})', filename)
        if not rune_match:
            continue
        
        rune_number = rune_match.group(1)
        
        # Analyze template
        analysis = analyze_template_complexity(file_path)
        category = categorize_template(analysis, filename)
        
        if category == 'core':
            core_templates.append({
                'rune': rune_number,
                'file': filename,
                'path': file_path,
                'analysis': analysis
            })
        else:
            pro_templates.append({
                'rune': rune_number,
                'file': filename,
                'path': file_path,
                'analysis': analysis
            })
        
        if (i + 1) % 100 == 0:
            print(f"Processed {i + 1}/{len(template_files)} templates...")
    
    print(f"\nCategorization Results:")
    print(f"Core templates: {len(core_templates)}")
    print(f"Pro templates: {len(pro_templates)}")
    
    # If Core is too large, select best ones
    if len(core_templates) > 100:
        print(f"\nCore collection too large ({len(core_templates)}), selecting top 75...")
        # Sort by quality and simplicity
        core_templates.sort(key=lambda x: (
            x['analysis']['quality_score'] if x['analysis'] else 5,
            -x['analysis']['complexity_score'] if x['analysis'] else 0
        ), reverse=True)
        
        # Move excess to Pro
        excess_core = core_templates[75:]
        core_templates = core_templates[:75]
        pro_templates.extend(excess_core)
        
        print(f"Final counts - Core: {len(core_templates)}, Pro: {len(pro_templates)}")
    
    # Copy files to collections
    print("\nCopying files to collections...")
    
    for template in core_templates:
        dest_path = os.path.join('runeflow_core_collection', template['file'])
        shutil.copy2(template['path'], dest_path)
    
    for template in pro_templates:
        dest_path = os.path.join('runeflow_pro_collection', template['file'])
        shutil.copy2(template['path'], dest_path)
    
    # Create summary files
    create_collection_summaries(core_templates, pro_templates)
    
    print(f"\n✅ Collections created successfully!")
    print(f"📁 runeflow_core_collection/: {len(core_templates)} templates")
    print(f"📁 runeflow_pro_collection/: {len(pro_templates)} templates")

def create_collection_summaries(core_templates, pro_templates):
    """Create summary files for each collection."""
    
    # Core collection summary
    core_summary = {
        "collection": "RuneFlow Core Collection",
        "description": "Essential automation templates for everyday workflows",
        "template_count": len(core_templates),
        "created": datetime.now().isoformat(),
        "templates": []
    }
    
    for template in core_templates:
        analysis = template['analysis'] or {}
        core_summary["templates"].append({
            "rune_number": template['rune'],
            "filename": template['file'],
            "node_count": analysis.get('node_count', 0),
            "quality_score": analysis.get('quality_score', 5),
            "complexity_score": analysis.get('complexity_score', 0)
        })
    
    with open('runeflow_core_collection_summary.json', 'w', encoding='utf-8') as f:
        json.dump(core_summary, f, indent=2, ensure_ascii=False)
    
    # Pro collection summary
    pro_summary = {
        "collection": "RuneFlow Pro Collection",
        "description": "Advanced automation templates with complex features",
        "template_count": len(pro_templates),
        "created": datetime.now().isoformat(),
        "templates": []
    }
    
    for template in pro_templates:
        analysis = template['analysis'] or {}
        pro_summary["templates"].append({
            "rune_number": template['rune'],
            "filename": template['file'],
            "node_count": analysis.get('node_count', 0),
            "quality_score": analysis.get('quality_score', 5),
            "complexity_score": analysis.get('complexity_score', 0),
            "has_ai": analysis.get('has_ai', False),
            "advanced_features": analysis.get('advanced_features', 0)
        })
    
    with open('runeflow_pro_collection_summary.json', 'w', encoding='utf-8') as f:
        json.dump(pro_summary, f, indent=2, ensure_ascii=False)

def main():
    """Main function."""
    print("🔥 RuneFlow Template Categorizer 🔥")
    print("Creating Core and Pro Collections...")
    print("=" * 60)
    
    create_collections()

if __name__ == "__main__":
    main()
