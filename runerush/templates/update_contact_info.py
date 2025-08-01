#!/usr/bin/env python3
"""
Script to update contact information in all RuneFlow template files.

This script:
1. Finds all JSON template files in the directory structure
2. Updates contact information from bryan@runeflow.co to support@runeflow.xyz
3. Updates website URLs from https://runeflow.co to https://RuneFlow.xyz
4. Updates all related URLs and contact information consistently
5. Creates backups before making changes
"""

import json
import os
import glob
import shutil
import re
from datetime import datetime

class ContactInfoUpdater:
    def __init__(self):
        # Old contact information
        self.old_email = "bryan@runeflow.co"
        self.old_website = "https://runeflow.co"
        self.old_domain = "runeflow.co"
        
        # New contact information
        self.new_email = "support@runeflow.xyz"
        self.new_website = "https://RuneFlow.xyz"
        self.new_domain = "RuneFlow.xyz"
        
        # Other old variations to replace
        self.old_variations = [
            "contact@runeflow.com",
            "https://runeflow.com",
            "runeflow.com"
        ]
        
        self.stats = {
            'files_processed': 0,
            'files_updated': 0,
            'changes_made': 0,
            'errors': 0
        }
        
    def find_template_files(self, base_path="."):
        """Find all JSON template files in the directory structure."""
        json_files = []
        
        # Search patterns for template files
        patterns = [
            "**/*.json",
            "*/*.json", 
            "*/templates/*.json",
            "processed_*/*.json",
            "complete/*.json",
            "core/*.json",
            "pro/*.json",
            "legacy/*.json"
        ]
        
        for pattern in patterns:
            files = glob.glob(os.path.join(base_path, pattern), recursive=True)
            json_files.extend(files)
        
        # Filter out manifest files and other non-template files
        template_files = []
        exclude_patterns = [
            'manifest.json',
            'manifest.yaml', 
            'state.json',
            'processing_state.json'
        ]
        
        for file_path in json_files:
            filename = os.path.basename(file_path)
            if not any(exclude in filename for exclude in exclude_patterns):
                template_files.append(file_path)
        
        return list(set(template_files))  # Remove duplicates
    
    def create_backup(self, file_path):
        """Create a backup of the original file."""
        backup_path = f"{file_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        try:
            shutil.copy2(file_path, backup_path)
            return True
        except Exception as e:
            print(f"Error creating backup for {file_path}: {e}")
            return False
    
    def update_string_content(self, content):
        """Update contact information in string content."""
        changes_made = 0
        original_content = content
        
        # Replace email addresses
        if self.old_email in content:
            content = content.replace(self.old_email, self.new_email)
            changes_made += content.count(self.new_email) - original_content.count(self.old_email)
        
        # Replace old variations
        for old_variation in self.old_variations:
            if old_variation in content:
                if "runeflow.com" in old_variation:
                    # Replace runeflow.com with RuneFlow.xyz
                    content = content.replace(old_variation, old_variation.replace("runeflow.com", "RuneFlow.xyz"))
                    changes_made += 1
        
        # Replace website URLs and domains
        content = content.replace(self.old_website, self.new_website)
        content = content.replace(self.old_domain, self.new_domain)
        
        # Update template library URLs
        content = content.replace("https://runeflow.co/templates", "https://RuneFlow.xyz/templates")
        
        # Count actual changes
        if content != original_content:
            changes_made = max(1, changes_made)  # At least 1 change if content differs
            
        return content, changes_made
    
    def update_json_content(self, data):
        """Recursively update contact information in JSON data."""
        changes_made = 0
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    updated_value, changes = self.update_string_content(value)
                    if changes > 0:
                        data[key] = updated_value
                        changes_made += changes
                elif isinstance(value, (dict, list)):
                    changes_made += self.update_json_content(value)
        
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, str):
                    updated_item, changes = self.update_string_content(item)
                    if changes > 0:
                        data[i] = updated_item
                        changes_made += changes
                elif isinstance(item, (dict, list)):
                    changes_made += self.update_json_content(item)
        
        return changes_made
    
    def update_template_file(self, file_path):
        """Update contact information in a single template file."""
        try:
            # Create backup first
            if not self.create_backup(file_path):
                print(f"Skipping {file_path} - couldn't create backup")
                return False
            
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Try to parse as JSON
            try:
                data = json.loads(content)
                changes_made = self.update_json_content(data)
                
                if changes_made > 0:
                    # Write back the updated JSON
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    print(f"✅ Updated {file_path} - {changes_made} changes made")
                    self.stats['files_updated'] += 1
                    self.stats['changes_made'] += changes_made
                    return True
                else:
                    print(f"⏭️  No changes needed in {file_path}")
                    # Remove backup since no changes were made
                    backup_files = glob.glob(f"{file_path}.backup_*")
                    for backup in backup_files:
                        if backup.endswith(datetime.now().strftime('%Y%m%d')):
                            os.remove(backup)
                    return False
                    
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing JSON in {file_path}: {e}")
                self.stats['errors'] += 1
                return False
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            self.stats['errors'] += 1
            return False
    
    def process_all_templates(self, base_path="."):
        """Process all template files in the directory structure."""
        print("🔍 Finding template files...")
        template_files = self.find_template_files(base_path)
        
        print(f"📁 Found {len(template_files)} template files to process")
        print("\n🚀 Starting contact information update...\n")
        
        for file_path in template_files:
            self.stats['files_processed'] += 1
            self.update_template_file(file_path)
        
        # Print summary
        print(f"\n📊 Summary:")
        print(f"   Files processed: {self.stats['files_processed']}")
        print(f"   Files updated: {self.stats['files_updated']}")  
        print(f"   Total changes made: {self.stats['changes_made']}")
        print(f"   Errors encountered: {self.stats['errors']}")
        
        if self.stats['files_updated'] > 0:
            print(f"\n✅ Successfully updated contact information:")
            print(f"   Email: {self.old_email} → {self.new_email}")
            print(f"   Website: {self.old_website} → {self.new_website}")
            print(f"   Domain: {self.old_domain} → {self.new_domain}")
        
        return self.stats

def main():
    """Main function to run the contact info updater."""
    print("🔥 RuneFlow Contact Information Updater 🔥")
    print("=" * 50)
    
    updater = ContactInfoUpdater()
    
    # Ask for confirmation
    print(f"This script will update contact information in all template files:")
    print(f"  Old email: {updater.old_email}")
    print(f"  New email: {updater.new_email}")
    print(f"  Old website: {updater.old_website}")
    print(f"  New website: {updater.new_website}")
    
    response = input("\nProceed with updates? (y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("❌ Operation cancelled.")
        return
    
    # Process all templates
    stats = updater.process_all_templates()
    
    if stats['errors'] > 0:
        print(f"\n⚠️  Warning: {stats['errors']} errors encountered during processing.")
        print("Check the output above for details.")

if __name__ == "__main__":
    main()
