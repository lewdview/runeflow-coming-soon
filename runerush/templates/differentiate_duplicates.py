#!/usr/bin/env python3
"""
Script to differentiate templates with duplicate names by analyzing their content
and adding unique identifiers based on their functionality.
"""

import json
import os
import glob
import re
from collections import defaultdict

def analyze_template_details(file_path):
    """Analyze template to extract unique characteristics."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        nodes = data.get('nodes', [])
        functional_nodes = [node for node in nodes if node.get('name') != '🔥 RuneFlow Template']
        
        # Get key characteristics
        node_count = len(functional_nodes)
        node_types = [node.get('type', '') for node in functional_nodes]
        node_names = [node.get('name', '') for node in functional_nodes]
        
        # Get metadata
        meta = data.get('runeflow_meta', {})
        original_filename = meta.get('original_filename', '')
        
        # Identify unique characteristics
        characteristics = []
        
        # Node count
        if node_count <= 5:
            characteristics.append('Simple')
        elif node_count <= 15:
            characteristics.append('Standard')
        else:
            characteristics.append('Complex')
        
        # Platform integrations
        platforms = []
        platform_map = {
            'slack': 'Slack',
            'telegram': 'Telegram', 
            'gmail': 'Gmail',
            'googleSheets': 'Sheets',
            'mattermost': 'Mattermost',
            'discord': 'Discord',
            'webhook': 'Webhook',
            'mysql': 'MySQL',
            'postgres': 'PostgreSQL',
            'mongodb': 'MongoDB',
            'openai': 'OpenAI',
            'hubspot': 'HubSpot',
            'salesforce': 'Salesforce',
            'airtable': 'Airtable',
            'notion': 'Notion'
        }
        
        for node_type in node_types:
            for key, platform in platform_map.items():
                if key.lower() in node_type.lower() and platform not in platforms:
                    platforms.append(platform)
        
        # Add top platforms as characteristics
        if platforms:
            characteristics.extend(platforms[:2])  # Top 2 platforms
        
        # Special features
        if any('openai' in nt.lower() for nt in node_types):
            characteristics.append('AI')
        
        if any('webhook' in nt.lower() for nt in node_types):
            characteristics.append('Webhook')
            
        if any('cron' in nt.lower() for nt in node_types):
            characteristics.append('Scheduled')
            
        if any('manual' in nt.lower() for nt in node_types):
            characteristics.append('Manual')
        
        # Use original filename hints if available
        if original_filename:
            if 'complex' in original_filename.lower():
                characteristics.append('Advanced')
            if any(str(i) in original_filename for i in range(10, 100)):
                num_match = re.search(r'(\d+)nodes', original_filename)
                if num_match:
                    characteristics.append(f'{num_match.group(1)}Nodes')
        
        return {
            'node_count': node_count,
            'platforms': platforms,
            'characteristics': characteristics,
            'original_filename': original_filename
        }
        
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return None

def generate_unique_name(base_name, rune_number, analysis, duplicate_index):
    """Generate a unique name based on analysis."""
    
    # Remove .json extension from base name
    base_name = base_name.replace('.json', '')
    
    # Get characteristics
    characteristics = analysis.get('characteristics', [])
    platforms = analysis.get('platforms', [])
    node_count = analysis.get('node_count', 0)
    
    # Build differentiator
    differentiators = []
    
    # Add complexity based on node count
    if node_count <= 5:
        differentiators.append('Basic')
    elif node_count <= 10:
        differentiators.append('Standard') 
    elif node_count <= 20:
        differentiators.append('Advanced')
    else:
        differentiators.append('Enterprise')
    
    # Add primary platform/integration
    if platforms:
        main_platform = platforms[0]
        if main_platform not in base_name:
            differentiators.append(main_platform)
    
    # Add specific characteristics
    for char in characteristics:
        if char not in base_name and char not in ['Standard', 'Complex']:
            differentiators.append(char)
            break  # Only add one specific characteristic
    
    # If still not unique enough, add node count
    if len(differentiators) < 2:
        differentiators.append(f'{node_count}Nodes')
    
    # Limit to 2 differentiators max
    differentiators = differentiators[:2]
    
    # If still no good differentiators, use index
    if not differentiators:
        differentiators = [f'Variant{duplicate_index + 1}']
    
    # Build new name
    diff_string = '_'.join(differentiators)
    new_name = f"{base_name}_{diff_string}"
    
    return f"{new_name}.json"

def differentiate_duplicates():
    """Find and differentiate all duplicate template names."""
    
    # Get all template files
    template_files = glob.glob('runeflow_numbered_templates/RuneFlow_Rune_*.json')
    
    # Group by base name (without Rune number)
    name_groups = defaultdict(list)
    
    for file_path in template_files:
        filename = os.path.basename(file_path)
        rune_match = re.search(r'RuneFlow_Rune_(\d{4})_(.*)', filename)
        if rune_match:
            rune_number = rune_match.group(1)
            base_name = rune_match.group(2)
            name_groups[base_name].append({
                'file_path': file_path,
                'rune_number': rune_number,
                'base_name': base_name
            })
    
    # Find duplicates
    duplicates = {name: files for name, files in name_groups.items() if len(files) > 1}
    
    print(f"Found {len(duplicates)} duplicate names affecting {sum(len(files) for files in duplicates.values())} files")
    print("\nTop duplicates:")
    sorted_duplicates = sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True)
    for name, files in sorted_duplicates[:10]:
        print(f"  {name}: {len(files)} files")
    
    # Process duplicates
    renamed_count = 0
    
    response = input(f"\nProceed to differentiate duplicates? (y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("Operation cancelled.")
        return
    
    for base_name, files in duplicates.items():
        print(f"\nProcessing {len(files)} duplicates of: {base_name}")
        
        # Analyze each duplicate
        analyses = []
        for file_info in files:
            analysis = analyze_template_details(file_info['file_path'])
            analyses.append(analysis)
        
        # Generate unique names
        for i, (file_info, analysis) in enumerate(zip(files, analyses)):
            if not analysis:
                continue
                
            try:
                # Generate new unique name
                new_name = generate_unique_name(
                    file_info['base_name'], 
                    file_info['rune_number'], 
                    analysis, 
                    i
                )
                
                # Create new file path
                new_filename = f"RuneFlow_Rune_{file_info['rune_number']}_{new_name}"
                new_file_path = os.path.join('runeflow_numbered_templates', new_filename)
                
                # Rename file
                os.rename(file_info['file_path'], new_file_path)
                
                print(f"  ✅ Rune {file_info['rune_number']}: {new_name}")
                renamed_count += 1
                
            except Exception as e:
                print(f"  ❌ Error renaming Rune {file_info['rune_number']}: {e}")
    
    print(f"\n✅ Differentiation complete!")
    print(f"   Files renamed: {renamed_count}")
    print(f"   Duplicates resolved: {len(duplicates)}")

def main():
    """Main function."""
    print("🔥 RuneFlow Template Name Differentiator 🔥")
    print("=" * 60)
    
    differentiate_duplicates()

if __name__ == "__main__":
    main()
