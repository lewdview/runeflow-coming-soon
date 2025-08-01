#!/usr/bin/env python3
"""
Simple script to analyze template files and suggest descriptive names.
Processes files one by one to avoid broken pipe errors.
"""

import json
import os
import re

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
        if 'n8n-nodes-base.openai' in node_types:
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
    
    # Default based on first meaningful node
    if functional_nodes:
        first_node_name = functional_nodes[0].get('name', '')
        if first_node_name and first_node_name != 'Start':
            return f"{first_node_name} Based Automation"
    
    return "General Purpose Automation"

def suggest_descriptive_name(file_path):
    """Suggest a descriptive name for a template file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Try to get existing name first
        existing_name = data.get('name', '')
        if existing_name and not existing_name.isdigit() and 'workflow' not in existing_name.lower():
            return existing_name
        
        # Analyze nodes to determine functionality
        suggested_name = analyze_workflow_nodes(data)
        return suggested_name
        
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return None

def main():
    """Process a single file at a time."""
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python descriptive_renamer.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    suggested_name = suggest_descriptive_name(file_path)
    if suggested_name:
        print(f"Suggested name: {suggested_name}")
    else:
        print("Could not analyze file")

if __name__ == "__main__":
    main()
