#!/usr/bin/env python3

import os
import json
import shutil
from pathlib import Path

def extract_outcome_from_template(template_data, filename):
    """Extract the main outcome/result from template data."""
    
    # First try to get from template metadata
    if 'meta' in template_data and 'description' in template_data['meta']:
        desc = template_data['meta']['description'].lower()
        # Extract key outcome words
        if 'notification' in desc or 'alert' in desc:
            return 'Notifications'
        elif 'email' in desc and ('send' in desc or 'process' in desc):
            return 'EmailProcessing'
        elif 'data' in desc and ('sync' in desc or 'transfer' in desc):
            return 'DataSync'
        elif 'report' in desc or 'analytics' in desc:
            return 'Reporting'
    
    # Analyze nodes to determine outcome
    nodes = template_data.get('nodes', [])
    node_types = [node.get('type', '').lower() for node in nodes]
    
    # Look for common outcome patterns
    if any('slack' in node_type for node_type in node_types):
        if any('webhook' in node_type for node_type in node_types):
            return 'SlackNotifications'
        return 'SlackIntegration'
    
    if any('gmail' in node_type or 'email' in node_type for node_type in node_types):
        return 'EmailAutomation'
    
    if any('telegram' in node_type for node_type in node_types):
        return 'TelegramBot'
    
    if any('database' in node_type or 'mysql' in node_type or 'postgres' in node_type for node_type in node_types):
        return 'DatabaseOps'
    
    if any('ai' in node_type or 'openai' in node_type for node_type in node_types):
        return 'AIProcessing'
    
    if any('webhook' in node_type for node_type in node_types):
        return 'WebhookHandling'
    
    if any('schedule' in node_type or 'cron' in node_type for node_type in node_types):
        return 'ScheduledTasks'
    
    # Extract from filename patterns
    filename_lower = filename.lower()
    if 'notification' in filename_lower:
        return 'Notifications'
    elif 'email' in filename_lower and 'assistant' in filename_lower:
        return 'EmailAssistant'
    elif 'automation' in filename_lower:
        return 'ProcessAutomation'
    elif 'webhook' in filename_lower and 'process' in filename_lower:
        return 'DataProcessing'
    elif 'api' in filename_lower:
        return 'APIIntegration'
    elif 'chatbot' in filename_lower or 'bot' in filename_lower:
        return 'ChatbotOps'
    elif 'sync' in filename_lower:
        return 'DataSync'
    elif 'backup' in filename_lower:
        return 'BackupOps'
    elif 'monitor' in filename_lower:
        return 'Monitoring'
    
    # Default fallback
    return 'Automation'

def enhance_template_names_with_outcomes(source_dir, target_dir):
    """Enhance template names to include outcome descriptions."""
    
    os.makedirs(target_dir, exist_ok=True)
    
    processed_count = 0
    
    for filename in os.listdir(source_dir):
        if not filename.endswith('.json') or filename.startswith('.'):
            continue
            
        source_path = os.path.join(source_dir, filename)
        
        try:
            with open(source_path, 'r', encoding='utf-8', errors='ignore') as f:
                template_data = json.load(f)
            
            # Extract components from current filename
            parts = filename.replace('.json', '').split('_')
            
            if len(parts) >= 4 and parts[0] == 'RuneFlow' and parts[1] == 'Rune':
                rune_number = parts[2]
                
                # Get the main name (everything except last 2 parts which are complexity/platform)
                if len(parts) > 5:
                    main_name = '_'.join(parts[3:-2])
                    complexity = parts[-2]
                    platform = parts[-1]
                else:
                    main_name = '_'.join(parts[3:])
                    complexity = 'Standard'
                    platform = 'Manual'
                
                # Extract outcome
                outcome = extract_outcome_from_template(template_data, filename)
                
                # Create enhanced filename
                enhanced_filename = f"RuneFlow_Rune_{rune_number}_{main_name}_{outcome}_{complexity}_{platform}.json"
                
            else:
                # Handle non-standard format
                outcome = extract_outcome_from_template(template_data, filename)
                enhanced_filename = f"{filename.replace('.json', '')}_{outcome}.json"
            
            # Copy with enhanced name
            target_path = os.path.join(target_dir, enhanced_filename)
            shutil.copy2(source_path, target_path)
            
            processed_count += 1
            if processed_count % 100 == 0:
                print(f"Processed {processed_count} templates...")
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
    
    print(f"✅ Enhanced {processed_count} template names with outcomes")
    return processed_count

def main():
    """Main function to enhance all collections."""
    
    base_dir = '/Volumes/extremeUno/webhalla_complete/runeflow_deployment/runerush'
    
    collections = [
        ('RUNERUSH_CORE_UPDATED', 'RUNERUSH_CORE_ENHANCED'),
        ('RUNERUSH_PRO_UPDATED', 'RUNERUSH_PRO_ENHANCED'),
        ('templates/runeflow_numbered_templates', 'RUNERUSH_COMPLETE_ENHANCED')
    ]
    
    total_enhanced = 0
    
    for source_name, target_name in collections:
        source_dir = os.path.join(base_dir, source_name)
        target_dir = os.path.join(base_dir, target_name)
        
        if os.path.exists(source_dir):
            print(f"\n🔄 Enhancing {source_name}...")
            count = enhance_template_names_with_outcomes(source_dir, target_dir)
            total_enhanced += count
            print(f"✅ Created {target_name} with {count} enhanced templates")
        else:
            print(f"❌ Source directory {source_dir} not found")
    
    print(f"\n🎉 Total templates enhanced: {total_enhanced}")

if __name__ == "__main__":
    main()
