#!/usr/bin/env python3
import os
import re
import json
import shutil

def analyze_workflow_complexity(filepath):
    """Analyze workflow complexity to determine appropriate tier level"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Count nodes
        nodes = data.get('nodes', [])
        node_count = len(nodes)
        
        # Analyze node types for complexity indicators
        ai_nodes = sum(1 for node in nodes if any(ai_type in str(node).lower() 
                      for ai_type in ['openai', 'llm', 'gpt', 'ai', 'agent', 'chain']))
        
        # Determine tier based on node count and AI complexity
        if node_count <= 5 or (node_count <= 10 and ai_nodes == 0):
            return "Basic"
        elif node_count <= 15 or (node_count <= 20 and ai_nodes <= 3):
            return "Standard" 
        elif node_count <= 25 or ai_nodes <= 8:
            return "Advanced"
        else:
            return "Enterprise"
            
    except Exception as e:
        print(f"Error analyzing {filepath}: {e}")
        return "Standard"  # Default fallback

def determine_category_and_tech(filename):
    """Determine category and tech stack from filename patterns"""
    filename_lower = filename.lower()
    
    # Category mapping
    if 'aiprocessing' in filename_lower or 'ai-powered' in filename_lower:
        category = "AIProcessing"
    elif 'emailautomation' in filename_lower or 'email' in filename_lower:
        category = "EmailAutomation"
    elif 'telegrambot' in filename_lower or 'telegram' in filename_lower:
        category = "TelegramBot"
    elif 'webhookhandling' in filename_lower or 'webhook' in filename_lower:
        category = "WebhookHandling"
    elif 'scheduledtasks' in filename_lower or 'scheduled' in filename_lower:
        category = "ScheduledTasks"
    elif 'databaseops' in filename_lower or 'database' in filename_lower:
        category = "DatabaseOps"
    elif 'slackintegration' in filename_lower or 'slack' in filename_lower:
        category = "SlackIntegration"
    elif 'slacknotifications' in filename_lower:
        category = "SlackNotifications"
    elif 'processautomation' in filename_lower:
        category = "ProcessAutomation"
    else:
        category = "Automation"
    
    # Tech stack mapping
    if 'openai' in filename_lower:
        tech = "OpenAI"
    elif 'gmail' in filename_lower:
        tech = "Gmail"
    elif 'sheets' in filename_lower:
        tech = "Sheets"
    elif 'telegram' in filename_lower:
        tech = "Telegram"
    elif 'webhook' in filename_lower:
        tech = "Webhook"
    elif 'manual' in filename_lower:
        tech = "Manual"
    elif 'airtable' in filename_lower:
        tech = "Airtable"
    elif 'postgresql' in filename_lower or 'postgres' in filename_lower:
        tech = "PostgreSQL"
    elif 'mysql' in filename_lower:
        tech = "MySQL"
    elif 'slack' in filename_lower:
        tech = "Slack"
    elif 'discord' in filename_lower:
        tech = "Discord"
    elif 'notion' in filename_lower:
        tech = "Notion"
    else:
        tech = "Simple"
    
    return category, tech

def fix_filename(filename):
    """Fix malformed filenames to match proper convention"""
    
    # Extract basic components
    rune_match = re.match(r'RuneFlow_Rune_(\d{4})_(.+)\.json$', filename)
    if not rune_match:
        print(f"Skipping malformed filename: {filename}")
        return filename
    
    rune_id = rune_match.group(1)
    description_part = rune_match.group(2)
    
    # Check if already properly formatted
    if re.match(r'.+_[A-Za-z]+_(Basic|Standard|Advanced|Enterprise)_[A-Za-z0-9]+$', description_part):
        return filename  # Already correct
    
    # Clean up description
    description_clean = re.sub(r'_+', '_', description_part)
    description_clean = re.sub(r'[^A-Za-z0-9_-]', '_', description_clean)
    description_clean = re.sub(r'_+', '_', description_clean).strip('_')
    
    # Determine category and tech stack
    category, tech = determine_category_and_tech(filename)
    
    # Get tier from file analysis
    tier = analyze_workflow_complexity(filename)
    
    # Construct new filename
    new_filename = f"RuneFlow_Rune_{rune_id}_{description_clean}_{category}_{tier}_{tech}.json"
    
    # Ensure no double underscores
    new_filename = re.sub(r'_+', '_', new_filename)
    
    return new_filename

def main():
    """Main function to fix all malformed filenames"""
    
    # Get all JSON files
    json_files = [f for f in os.listdir('.') if f.endswith('.json') and f.startswith('RuneFlow_Rune_')]
    
    # Find files missing tier levels
    problematic_files = []
    for filename in json_files:
        if not re.search(r'_(Basic|Standard|Advanced|Enterprise)_', filename):
            problematic_files.append(filename)
    
    print(f"Found {len(problematic_files)} files needing fixes")
    
    # Fix each problematic file
    fixes_applied = 0
    for old_filename in problematic_files:
        try:
            new_filename = fix_filename(old_filename)
            
            if new_filename != old_filename:
                if os.path.exists(new_filename):
                    # If target exists, make filename unique
                    counter = 1
                    base, ext = os.path.splitext(new_filename)
                    while os.path.exists(f"{base}_V{counter}{ext}"):
                        counter += 1
                    new_filename = f"{base}_V{counter}{ext}"
                
                # Rename the file
                os.rename(old_filename, new_filename)
                print(f"Fixed: {old_filename} -> {new_filename}")
                fixes_applied += 1
                
        except Exception as e:
            print(f"Error fixing {old_filename}: {e}")
    
    print(f"\nCompleted: {fixes_applied} files renamed")
    
    # Verify results
    remaining_issues = 0
    for filename in os.listdir('.'):
        if filename.endswith('.json') and filename.startswith('RuneFlow_Rune_'):
            if not re.search(r'_(Basic|Standard|Advanced|Enterprise)_', filename):
                remaining_issues += 1
    
    print(f"Remaining issues: {remaining_issues}")
    
    if remaining_issues == 0:
        print("✅ All naming convention issues resolved!")
    else:
        print("❌ Some issues remain to be fixed")

if __name__ == "__main__":
    main()
