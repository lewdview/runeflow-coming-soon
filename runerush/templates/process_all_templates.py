#!/usr/bin/env python3
"""
RuneFlow Complete Template Processor
Process ALL 8000+ templates for the complete collection vault
Creates bundles: Core 50, Pro 50, Complete Vault
"""

import json
import yaml
import os
import glob
import re
import shutil
from datetime import datetime
from pathlib import Path
import unicodedata

# Processing state tracker
PROCESSING_STATE_FILE = 'template_processing_state.json'

class RuneFlowTemplateProcessor:
    def __init__(self):
        self.processed_count = 0
        self.failed_count = 0
        self.bundles = {
            'core_50': [],
            'pro_50': [],
            'complete_vault': []
        }
        self.categories = {}
        self.load_processing_state()
        
    def load_processing_state(self):
        """Load previous processing state if exists"""
        if os.path.exists(PROCESSING_STATE_FILE):
            try:
                with open(PROCESSING_STATE_FILE, 'r') as f:
                    state = json.load(f)
                    self.processed_count = state.get('processed_count', 0)
                    self.failed_count = state.get('failed_count', 0)
                    self.bundles = state.get('bundles', {'core_50': [], 'pro_50': [], 'complete_vault': []})
                    self.categories = state.get('categories', {})
                print(f"📊 Resuming processing from: {self.processed_count} templates processed")
            except Exception as e:
                print(f"⚠️ Could not load previous state: {e}")
    
    def save_processing_state(self):
        """Save current processing state"""
        state = {
            'processed_count': self.processed_count,
            'failed_count': self.failed_count,
            'bundles': self.bundles,
            'categories': self.categories,
            'last_updated': datetime.now().isoformat()
        }
        with open(PROCESSING_STATE_FILE, 'w') as f:
            json.dump(state, f, indent=2)
    
    def clean_template_name(self, filename):
        """Clean template filename - remove emojis, standardize naming"""
        # Remove emojis and special characters
        name = filename.replace('.json', '')
        
        # Remove emojis using unicode categories
        name = ''.join(char for char in name if unicodedata.category(char) not in ('So', 'Sm'))
        
        # Clean up common patterns
        name = re.sub(r'^[^a-zA-Z0-9]+', '', name)  # Remove leading non-alphanumeric
        name = re.sub(r'[^\w\-_\s]', '_', name)     # Replace special chars with underscore
        name = re.sub(r'\s+', '_', name)            # Replace spaces with underscore
        name = re.sub(r'_+', '_', name)             # Collapse multiple underscores
        name = name.strip('_')                       # Remove leading/trailing underscores
        
        # Ensure name is not empty
        if not name:
            name = f"template_{self.processed_count}"
        
        return name
    
    def categorize_template(self, template_data, filename):
        """Categorize template based on content analysis"""
        content = json.dumps(template_data).lower()
        
        # AI & Research
        if any(term in content for term in ['openai', 'chatgpt', 'gpt', 'langchain', 'ai', 'artificial intelligence']):
            return 'AI & Research'
        
        # Email & Communication
        elif any(term in content for term in ['gmail', 'email', 'sendgrid', 'mailchimp', 'smtp']):
            return 'Email & Communication'
        
        # Social Media
        elif any(term in content for term in ['twitter', 'facebook', 'instagram', 'linkedin', 'social']):
            return 'Social Media'
        
        # Business Intelligence
        elif any(term in content for term in ['analytics', 'report', 'dashboard', 'metrics', 'kpi']):
            return 'Business Intelligence'
        
        # Forms & Surveys
        elif any(term in content for term in ['form', 'survey', 'typeform', 'jotform']):
            return 'Forms & Surveys'
        
        # Personal Automation
        elif any(term in content for term in ['calendar', 'task', 'todo', 'reminder', 'schedule']):
            return 'Personal Automation'
        
        # Integration Hub
        elif any(term in content for term in ['webhook', 'api', 'integration', 'connector']):
            return 'Integration Hub'
        
        # Default category
        else:
            return 'Other Templates'
    
    def assess_template_quality(self, template_data, filename):
        """Assess template quality for bundle placement"""
        score = 0
        
        # Node count scoring
        nodes = template_data.get('nodes', [])
        node_count = len(nodes)
        if node_count >= 20:
            score += 3
        elif node_count >= 10:
            score += 2
        elif node_count >= 5:
            score += 1
        
        # Complexity scoring
        has_ai = any('openai' in str(node).lower() or 'langchain' in str(node).lower() for node in nodes)
        has_webhooks = any(node.get('type') == 'n8n-nodes-base.webhook' for node in nodes)
        has_credentials = any('credentials' in str(node) for node in nodes)
        
        if has_ai:
            score += 3
        if has_webhooks:
            score += 2
        if has_credentials:
            score += 1
        
        # Description quality
        description = template_data.get('runeflow_description', '')
        if len(description) > 100:
            score += 2
        elif len(description) > 50:
            score += 1
        
        return score
    
    def process_single_template(self, file_path):
        """Process a single template file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                template_data = json.load(f)
            
            # Clean filename
            original_filename = Path(file_path).stem
            clean_name = self.clean_template_name(original_filename)
            
            # Categorize template
            category = self.categorize_template(template_data, original_filename)
            
            # Assess quality for bundle placement
            quality_score = self.assess_template_quality(template_data, original_filename)
            
            # Add RuneFlow metadata
            runeflow_meta = {
                'template_id': clean_name,
                'template_name': clean_name.replace('_', ' ').title(),
                'original_filename': original_filename,
                'category': category,
                'quality_score': quality_score,
                'processed_date': datetime.now().isoformat(),
                'nodes_count': len(template_data.get('nodes', [])),
                'has_credentials': any('credentials' in str(node) for node in template_data.get('nodes', [])),
                'has_webhooks': any(node.get('type') == 'n8n-nodes-base.webhook' for node in template_data.get('nodes', [])),
                'has_ai_nodes': any('openai' in str(node).lower() or 'langchain' in str(node).lower() 
                                  for node in template_data.get('nodes', []))
            }
            
            # Add to template data
            template_data['runeflow_meta'] = runeflow_meta
            template_data.setdefault('runeflow_description', f"Intelligent automation workflow: {category}")
            template_data.setdefault('runeflow_contact', 'bryan@runeflow.co')
            template_data.setdefault('runeflow_website', 'https://runeflow.co')
            template_data.setdefault('runeflow_tagline', 'Unlock the Power of Ancient Wisdom Through Modern Automation')
            
            # Assign to bundles based on quality
            if quality_score >= 8:
                self.bundles['pro_50'].append(runeflow_meta)
            elif quality_score >= 5:
                self.bundles['core_50'].append(runeflow_meta)
            
            self.bundles['complete_vault'].append(runeflow_meta)
            
            # Track categories
            self.categories[category] = self.categories.get(category, 0) + 1
            
            # Save processed template
            output_dir = Path('processed_complete_vault')
            output_dir.mkdir(exist_ok=True)
            
            output_file = output_dir / f"{clean_name}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(template_data, f, indent=2, ensure_ascii=False)
            
            self.processed_count += 1
            return True
            
        except Exception as e:
            print(f"❌ Failed to process {file_path}: {str(e)}")
            self.failed_count += 1
            return False
    
    def process_all_templates(self):
        """Process all templates in processed_with_descriptions"""
        print("🚀 Starting complete template processing...")
        
        # Get all JSON files
        template_files = glob.glob('./processed_with_descriptions/*.json')
        # Filter out system files
        template_files = [f for f in template_files if not Path(f).name.startswith('._')]
        
        total_files = len(template_files)
        print(f"📊 Found {total_files} templates to process")
        
        # Process in batches to save state
        batch_size = 100
        for i, file_path in enumerate(template_files):
            if i < self.processed_count:  # Skip already processed
                continue
                
            print(f"🔄 Processing {i+1}/{total_files}: {Path(file_path).name}")
            
            self.process_single_template(file_path)
            
            # Save state every batch
            if (i + 1) % batch_size == 0:
                self.save_processing_state()
                print(f"💾 Saved state at {i+1} templates")
        
        # Final save
        self.save_processing_state()
        print(f"✅ Processing complete! Processed: {self.processed_count}, Failed: {self.failed_count}")
    
    def create_bundle_manifests(self):
        """Create manifest files for each bundle"""
        print("📝 Creating bundle manifests...")
        
        # Core 50 Bundle
        core_50_sorted = sorted(self.bundles['core_50'], key=lambda x: x['quality_score'], reverse=True)[:50]
        self.create_manifest('core_50', core_50_sorted, "Core 50 RuneFlow Templates - Essential Automation Collection")
        
        # Pro 50 Bundle
        pro_50_sorted = sorted(self.bundles['pro_50'], key=lambda x: x['quality_score'], reverse=True)[:50]
        self.create_manifest('pro_50', pro_50_sorted, "Pro 50 RuneFlow Templates - Premium Automation Collection")
        
        # Complete Vault (first 1000 for initial release)
        vault_sorted = sorted(self.bundles['complete_vault'], key=lambda x: x['quality_score'], reverse=True)[:1000]
        self.create_manifest('complete_vault', vault_sorted, "Complete RuneFlow Vault - Ultimate Automation Collection")
    
    def create_manifest(self, bundle_name, templates, description):
        """Create manifest for a specific bundle"""
        manifest = {
            'manifest_info': {
                'bundle_name': bundle_name,
                'version': '1.0',
                'created_date': datetime.now().strftime('%Y-%m-%d'),
                'total_templates': len(templates),
                'provider': 'RuneFlow',
                'description': description,
                'contact': 'bryan@runeflow.co',
                'website': 'https://runeflow.co',
                'tagline': 'Unlock the Power of Ancient Wisdom Through Modern Automation'
            },
            'templates': templates
        }
        
        # Save JSON
        json_file = f'runeflow_{bundle_name}_manifest.json'
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        # Save YAML
        yaml_file = f'runeflow_{bundle_name}_manifest.yaml'
        with open(yaml_file, 'w', encoding='utf-8') as f:
            yaml.dump(manifest, f, default_flow_style=False, allow_unicode=True, indent=2)
        
        print(f"✅ Created {bundle_name} manifest with {len(templates)} templates")

def main():
    processor = RuneFlowTemplateProcessor()
    
    print("🎯 RuneFlow Complete Template Processing")
    print("="*50)
    
    # Process all templates
    processor.process_all_templates()
    
    # Create bundle manifests
    processor.create_bundle_manifests()
    
    # Final report
    print("\n🎉 PROCESSING COMPLETE!")
    print(f"📊 Total processed: {processor.processed_count}")
    print(f"❌ Failed: {processor.failed_count}")
    print(f"📁 Categories: {len(processor.categories)}")
    print("\n📦 Bundles created:")
    for bundle, templates in processor.bundles.items():
        print(f"  {bundle}: {len(templates)} templates")

if __name__ == '__main__':
    main()
