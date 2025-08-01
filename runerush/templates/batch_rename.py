#!/usr/bin/env python3
"""
Batch processor to rename template files with descriptive names.
Processes 10 files at a time to avoid overwhelming the system.
"""

import json
import os
import glob
import re
from datetime import datetime

def analyze_workflow_nodes(data):
    """Analyze workflow nodes to determine functionality."""
    nodes = data.get('nodes', [])
    if not nodes:
        return "Empty Workflow"
    
    # Skip branding notes
    functional_nodes = [node for node in nodes if node.get('name') != '🔥 RuneFlow Template']
    
    # Check for specific node types
    node_types = [node.get('type', '') for node in functional_nodes]
    node_names = [node.get('name', '') for node in functional_nodes]
    
    # Get workflow name if available
    workflow_name = data.get('name', '')
    if workflow_name and not workflow_name.isdigit() and 'workflow' not in workflow_name.lower():
        return workflow_name
    
    # Common patterns
    if 'n8n-nodes-base.webhook' in node_types:
        if 'n8n-nodes-base.mattermost' in node_types:
            return "Mattermost Notification on Webhook Trigger"
        elif 'n8n-nodes-base.slack' in node_types:
            return "Slack Notification on Webhook Trigger"
        elif 'n8n-nodes-base.gmail' in node_types:
            return "Gmail Email Processing via Webhook"
        elif 'n8n-nodes-base.telegram' in node_types:
            return "Telegram Bot Webhook Handler"
        else:
            return "Webhook Data Processing"
    
    if 'n8n-nodes-base.cron' in node_types:
        if 'n8n-nodes-base.httpRequest' in node_types:
            return "Scheduled API Data Fetcher"
        elif 'n8n-nodes-base.googleSheets' in node_types:
            return "Scheduled Google Sheets Update"
        else:
            return "Scheduled Task Automation"
    
    if 'n8n-nodes-base.manual' in node_types:
        if any('openai' in node_type.lower() for node_type in node_types):
            return "Manual AI Processing Task"
        else:
            return "Manual Data Processing"
    
    # AI-related workflows
    if any('openai' in node_type.lower() for node_type in node_types):
        if 'n8n-nodes-base.telegram' in node_types:
            return "AI-Powered Telegram Bot"
        elif 'n8n-nodes-base.gmail' in node_types:
            return "AI Email Assistant"
        else:
            return "AI-Powered Automation"
    
    # Database operations
    if any('mysql' in node_type.lower() or 'postgres' in node_type.lower() for node_type in node_types):
        return "Database Management Automation"
    
    # Communication platforms
    if 'n8n-nodes-base.slack' in node_types:
        return "Slack Integration Automation"
    
    # Default fallback
    return "General Purpose Automation"

def clean_filename(name):
    """Clean a name to be filesystem-friendly."""
    # Remove special characters and replace with underscores
    name = re.sub(r'[^\w\s\-_.]', '_', name)
    # Replace multiple spaces/underscores with single underscore
    name = re.sub(r'[_\s]+', '_', name)
    # Remove leading/trailing underscores
    name = name.strip('_')
    # Limit length
    if len(name) > 80:
        name = name[:80]
    return name

def process_batch(start_index=0, batch_size=50):
    """Process a batch of files."""
    # Get all RuneFlow files
    files = glob.glob("processed_complete_vault/RuneFlow_Rune_*.json")
    files.sort()
    
    end_index = min(start_index + batch_size, len(files))
    batch_files = files[start_index:end_index]
    
    print(f"Processing batch {start_index//batch_size + 1}: files {start_index+1} to {end_index}")
    print(f"Total files: {len(files)}")
    print("-" * 50)
    
    for i, file_path in enumerate(batch_files):
        try:
            # Read file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Get descriptive name
            descriptive_name = analyze_workflow_nodes(data)
            
            # Extract Rune number from filename
            rune_match = re.search(r'Rune_(\d{4})', file_path)
            if not rune_match:
                print(f"❌ Could not extract Rune number from {file_path}")
                continue
            
            rune_number = rune_match.group(1)
            
            # Clean the descriptive name for filename
            clean_name = clean_filename(descriptive_name)
            
            # Create new filename
            new_filename = f"RuneFlow_Rune_{rune_number}_{clean_name}.json"
            new_path = os.path.join("processed_complete_vault", new_filename)
            
            # Check if we need to rename
            current_filename = os.path.basename(file_path)
            if current_filename == new_filename:
                print(f"⏭️  {rune_number}: Already has good name")
                continue
            
            # Rename file
            os.rename(file_path, new_path)
            print(f"✅ {rune_number}: {descriptive_name}")
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\nBatch complete. Next batch starts at index {end_index}")
    if end_index < len(files):
        print(f"Run: python3 batch_rename.py {end_index}")
    else:
        print("🎉 All files processed!")

def main():
    """Main function."""
    import sys
    
    start_index = 0
    if len(sys.argv) > 1:
        try:
            start_index = int(sys.argv[1])
        except ValueError:
            print("Usage: python3 batch_rename.py [start_index]")
            sys.exit(1)
    
    process_batch(start_index)

if __name__ == "__main__":
    main()
