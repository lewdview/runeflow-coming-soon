#!/usr/bin/env python3
"""
Fix duplicate template names by adding unique differentiators based on template content.
"""

import json
import os
import shutil
from collections import defaultdict
from pathlib import Path


def get_template_metadata(filepath):
    """Extract key metadata from template to create unique identifiers."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract distinguishing features
        metadata = data.get('meta', {})
        nodes = data.get('nodes', [])
        
        # Key differentiators
        template_id = metadata.get('template_id', '')
        nodes_count = len(nodes)
        quality_score = metadata.get('quality_score', 0)
        
        # Get unique node types for differentiation
        node_types = set()
        for node in nodes:
            node_type = node.get('type', '').replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '')
            if node_type and node_type != 'stickyNote':
                node_types.add(node_type)
        
        # Create a signature based on key characteristics
        node_signature = '_'.join(sorted(list(node_types))[:3])  # Top 3 node types
        
        return {
            'template_id': template_id,
            'nodes_count': nodes_count,
            'quality_score': quality_score,
            'node_signature': node_signature,
            'original_filename': metadata.get('original_filename', ''),
            'processed_date': metadata.get('processed_date', '')
        }
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None


def create_unique_filename(base_name, metadata, duplicate_index):
    """Create a unique filename by adding differentiating information."""
    # Remove the .json extension for processing
    base_name = base_name.replace('.json', '')
    
    # Add differentiating suffix based on available metadata
    differentiators = []
    
    # Add node count if significantly different
    if metadata['nodes_count'] > 0:
        differentiators.append(f"Nodes{metadata['nodes_count']}")
    
    # Add quality score
    if metadata['quality_score'] > 0:
        differentiators.append(f"Q{metadata['quality_score']}")
    
    # Add node signature if available
    if metadata['node_signature']:
        # Limit node signature length
        node_sig = metadata['node_signature'][:30]
        differentiators.append(f"{node_sig}")
    
    # If still not unique enough, add template ID fragment
    if metadata['template_id']:
        template_frag = metadata['template_id'].replace('-', '').replace('_', '')[:15]
        differentiators.append(f"{template_frag}")
    
    # Add duplicate index as final differentiator
    differentiators.append(f"V{duplicate_index}")
    
    # Combine differentiators (limit total length)
    diff_string = '_'.join(differentiators)[:50]
    
    return f"{base_name}_{diff_string}.json"


def fix_duplicates_in_directory(directory_path):
    """Fix duplicate names in a specific directory."""
    directory = Path(directory_path)
    if not directory.exists():
        print(f"Directory {directory_path} does not exist")
        return
    
    print(f"\nProcessing directory: {directory_path}")
    
    # Group files by their descriptive name (after rune number)
    name_groups = defaultdict(list)
    
    for filepath in directory.glob('*.json'):
        filename = filepath.name
        # Extract the descriptive part after the rune number
        if 'RuneFlow_Rune_' in filename:
            parts = filename.split('_', 3)  # Split into ['RuneFlow', 'Rune', 'XXXX', 'description']
            if len(parts) >= 4:
                descriptive_name = parts[3]  # Everything after the rune number
                name_groups[descriptive_name].append(filepath)
    
    # Process duplicates
    total_processed = 0
    for descriptive_name, filepaths in name_groups.items():
        if len(filepaths) > 1:
            print(f"\nFound {len(filepaths)} duplicates for: {descriptive_name}")
            
            # Get metadata for each duplicate
            file_metadata = []
            for filepath in filepaths:
                metadata = get_template_metadata(filepath)
                if metadata:
                    file_metadata.append((filepath, metadata))
            
            # Sort by some criteria for consistent naming
            file_metadata.sort(key=lambda x: (x[1]['nodes_count'], x[1]['quality_score'], x[1]['template_id']))
            
            # Rename duplicates
            for i, (filepath, metadata) in enumerate(file_metadata):
                if i == 0:
                    # Keep the first one as is (the "main" version)
                    print(f"  Keeping: {filepath.name}")
                    continue
                
                # Create new unique filename
                old_filename = filepath.name
                
                # Extract rune number prefix
                parts = old_filename.split('_', 3)
                rune_prefix = '_'.join(parts[:3])  # 'RuneFlow_Rune_XXXX'
                
                # Create unique filename
                unique_descriptive = create_unique_filename(descriptive_name, metadata, i)
                new_filename = f"{rune_prefix}_{unique_descriptive}"
                
                new_filepath = filepath.parent / new_filename
                
                # Rename the file
                try:
                    filepath.rename(new_filepath)
                    print(f"  Renamed: {old_filename}")
                    print(f"       To: {new_filename}")
                    total_processed += 1
                except Exception as e:
                    print(f"  Error renaming {old_filename}: {e}")
    
    print(f"\nTotal files processed in {directory_path}: {total_processed}")


def main():
    """Main function to fix duplicates in both enhanced directories."""
    print("=== Fixing Duplicate Template Names ===")
    
    # Process all directories including complete collection
    directories = [
        'RUNERUSH_CORE_ENHANCED',
        'RUNERUSH_PRO_ENHANCED',
        'RUNERUSH_COMPLETE_ENHANCED'
    ]
    
    for directory in directories:
        fix_duplicates_in_directory(directory)
    
    print("\n=== Duplicate fixing complete ===")
    
    # Verify no duplicates remain
    print("\n=== Verification ===")
    for directory in directories:
        if os.path.exists(directory):
            print(f"\nChecking {directory} for remaining duplicates...")
            # Check for duplicates after the rune number
            result = os.system(f"ls {directory}/ | sed 's/RuneFlow_Rune_[0-9]*_//' | sort | uniq -d")
            if result == 0:
                print(f"No duplicates found in {directory}")


if __name__ == "__main__":
    main()
