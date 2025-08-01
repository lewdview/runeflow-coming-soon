#!/usr/bin/env python3

import json
import os
from collections import defaultdict

def analyze_template_collection(directory_path):
    """Analyze a collection of templates and generate comprehensive summary."""
    
    if not os.path.exists(directory_path):
        print(f"Directory {directory_path} does not exist")
        return None
    
    templates = []
    complexity_counts = defaultdict(int)
    platform_counts = defaultdict(int)
    category_counts = defaultdict(int)
    node_count_distribution = defaultdict(int)
    
    # Process all JSON files in the directory
    for filename in os.listdir(directory_path):
        if filename.endswith('.json') and not filename.startswith('.'):
            filepath = os.path.join(directory_path, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    template_data = json.load(f)
                
                # Extract metadata
                nodes = template_data.get('nodes', [])
                node_count = len(nodes)
                
                # Extract from filename (differentiated templates)
                filename_parts = filename.replace('.json', '').split('_')
                
                # Extract complexity and platform from filename
                complexity = 'Basic'
                platform = 'Manual'
                
                if len(filename_parts) >= 6:
                    # Format: RuneFlow_Rune_XXXX_Name_Complexity_Platform
                    if filename_parts[-2] in ['Basic', 'Standard', 'Advanced', 'Enterprise']:
                        complexity = filename_parts[-2]
                        platform = filename_parts[-1]
                    elif filename_parts[-1] in ['Simple', 'Manual', 'OpenAI', 'Gmail', 'Slack', 'Telegram', 'Sheets', 'Airtable', 'HubSpot', 'Salesforce', 'PostgreSQL', 'MySQL', 'MongoDB', 'Webhook', 'Discord', 'Notion', 'Advanced']:
                        if 'Nodes' in filename_parts[-1]:
                            complexity = 'Standard'
                            platform = filename_parts[-1]
                        else:
                            platform = filename_parts[-1]
                
                # Determine category from template name
                template_name = filename.lower()
                category = 'General Automation'
                
                if 'ai' in template_name or 'openai' in template_name:
                    category = 'AI-Powered'
                elif 'webhook' in template_name:
                    category = 'Webhook Processing'
                elif 'email' in template_name or 'gmail' in template_name:
                    category = 'Email Automation'
                elif 'slack' in template_name or 'telegram' in template_name or 'discord' in template_name:
                    category = 'Communication'
                elif 'database' in template_name or 'mysql' in template_name or 'postgresql' in template_name:
                    category = 'Database Management'
                elif 'scheduled' in template_name or 'scheduler' in template_name:
                    category = 'Scheduled Tasks'
                elif 'social' in template_name or 'twitter' in template_name or 'linkedin' in template_name:
                    category = 'Social Media'
                
                template_info = {
                    'filename': filename,
                    'rune_number': int(filename_parts[2]) if len(filename_parts) > 2 else None,
                    'name': '_'.join(filename_parts[3:-2]) if len(filename_parts) > 5 else filename.replace('.json', ''),
                    'complexity': complexity,
                    'platform': platform,
                    'category': category,
                    'node_count': node_count,
                    'description': f"{complexity} {category.lower()} workflow with {platform} integration"
                }
                
                templates.append(template_info)
                
                # Update counters
                complexity_counts[complexity] += 1
                platform_counts[platform] += 1
                category_counts[category] += 1
                
                # Node count distribution
                if node_count <= 5:
                    node_count_distribution['Simple (1-5 nodes)'] += 1
                elif node_count <= 10:
                    node_count_distribution['Standard (6-10 nodes)'] += 1
                elif node_count <= 20:
                    node_count_distribution['Advanced (11-20 nodes)'] += 1
                else:
                    node_count_distribution['Enterprise (21+ nodes)'] += 1
                
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue
    
    # Sort templates by rune number
    templates.sort(key=lambda x: x['rune_number'] or 0)
    
    # Generate summary
    summary = {
        'total_templates': len(templates),
        'complexity_distribution': dict(complexity_counts),
        'platform_distribution': dict(platform_counts),
        'category_distribution': dict(category_counts),
        'node_count_distribution': dict(node_count_distribution),
        'templates': templates,
        'sample_templates': templates[:10],  # First 10 as samples
        'generated_at': '2025-01-31T08:35:00Z'
    }
    
    return summary

def main():
    """Generate updated collection summaries."""
    
    collections = {
        'RUNERUSH_CORE_UPDATED': 'RUNERUSH Core Collection (50 Essential Templates)',
        'RUNERUSH_PRO_UPDATED': 'RUNERUSH Pro Collection (50 Advanced Templates)', 
        'RUNERUSH_COMPLETE_UPDATED': 'RUNERUSH Complete Vault (All 8,142 Templates)'
    }
    
    for collection_dir, collection_name in collections.items():
        print(f"\n🔄 Processing {collection_name}...")
        
        summary = analyze_template_collection(collection_dir)
        
        if summary:
            # Add collection metadata
            summary['collection_name'] = collection_name
            summary['collection_type'] = collection_dir.replace('RUNERUSH_', '').replace('_UPDATED', '').lower()
            
            # Save summary
            output_file = f"{collection_dir}_summary.json"
            with open(output_file, 'w') as f:
                json.dump(summary, f, indent=2)
            
            print(f"✅ Generated summary: {output_file}")
            print(f"   📊 Total templates: {summary['total_templates']}")
            print(f"   🏷️  Categories: {len(summary['category_distribution'])}")
            print(f"   🔧 Platforms: {len(summary['platform_distribution'])}")
            print(f"   📈 Complexity levels: {len(summary['complexity_distribution'])}")
        else:
            print(f"❌ Failed to process {collection_name}")

if __name__ == "__main__":
    main()
