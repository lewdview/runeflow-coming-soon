#!/usr/bin/env python3
"""
Script to rename template files with RuneFlow Rune numbers.

This script:
1. Finds all JSON template files in the directory structure
2. Assigns unique Rune numbers to each template
3. Renames files with format: RuneFlow_Rune_XXXX_original_name.json
4. Creates a mapping file to track the renaming
5. Updates internal template metadata with the Rune number
"""

import json
import os
import glob
import shutil
import re
from datetime import datetime
from pathlib import Path

class RuneFlowRenamer:
    def __init__(self):
        self.rune_counter = 1
        self.renamed_files = {}
        self.errors = []
        self.stats = {
            'files_processed': 0,
            'files_renamed': 0,
            'files_updated': 0,
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
            'processing_state.json',
            'rename_with_rune_numbers.py',
            'update_contact_info.py'
        ]
        
        for file_path in json_files:
            filename = os.path.basename(file_path)
            # Skip files that already have Rune numbers
            if filename.startswith('RuneFlow_Rune_'):
                continue
            if not any(exclude in filename for exclude in exclude_patterns):
                template_files.append(file_path)
        
        return list(set(template_files))  # Remove duplicates

    def generate_rune_number(self):
        """Generate a unique 4-digit Rune number."""
        rune_num = f"{self.rune_counter:04d}"
        self.rune_counter += 1
        return rune_num

    def clean_filename(self, filename):
        """Clean filename for better readability."""
        # Remove .json extension
        name = filename.replace('.json', '')
        
        # Replace problematic characters
        name = re.sub(r'[^\w\s\-_.]', '_', name)
        
        # Replace multiple underscores/spaces with single underscore
        name = re.sub(r'[_\s]+', '_', name)
        
        # Remove leading/trailing underscores
        name = name.strip('_')
        
        # Limit length to reasonable size
        if len(name) > 100:
            name = name[:100]
            
        return name

    def update_template_metadata(self, file_path, rune_number):
        """Update the template's internal metadata with the Rune number."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add Rune number to various metadata locations
            updated = False
            
            # Update meta section if it exists
            if 'meta' in data:
                if 'RuneFlow' in data['meta']:
                    data['meta']['RuneFlow']['rune_number'] = rune_number
                    updated = True
                else:
                    data['meta']['RuneFlow'] = {
                        'rune_number': rune_number,
                        'provider': 'RuneFlow - Norse Automation Mastery',
                        'contact': 'support@runeflow.xyz',
                        'website': 'https://RuneFlow.xyz'
                    }
                    updated = True
            else:
                data['meta'] = {
                    'RuneFlow': {
                        'rune_number': rune_number,
                        'provider': 'RuneFlow - Norse Automation Mastery',
                        'contact': 'support@runeflow.xyz',
                        'website': 'https://RuneFlow.xyz'
                    }
                }
                updated = True
            
            # Add top-level rune number field
            data['runeflow_rune'] = rune_number
            updated = True
            
            # Update branding notes in nodes if they exist
            if 'nodes' in data and isinstance(data['nodes'], list):
                for node in data['nodes']:
                    if (isinstance(node, dict) and 
                        node.get('name') == '🔥 RuneFlow Template' and
                        'parameters' in node and 
                        'content' in node['parameters']):
                        
                        content = node['parameters']['content']
                        if 'RuneFlow AUTOMATION TEMPLATE' in content:
                            # Add Rune number to the branding note
                            if f'🆔 Rune: {rune_number}' not in content:
                                # Insert Rune number after the template line
                                content = content.replace(
                                    '🔥 RuneFlow AUTOMATION TEMPLATE 🔥\\n\\n',
                                    f'🔥 RuneFlow AUTOMATION TEMPLATE 🔥\\n🆔 Rune: {rune_number}\\n\\n'
                                )
                                node['parameters']['content'] = content
                                updated = True
            
            if updated:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                return True
                
        except Exception as e:
            self.errors.append(f"Error updating metadata for {file_path}: {e}")
            return False
        
        return False

    def rename_file(self, file_path):
        """Rename a single template file with Rune number."""
        try:
            # Generate Rune number
            rune_number = self.generate_rune_number()
            
            # Get file details
            directory = os.path.dirname(file_path)
            filename = os.path.basename(file_path)
            clean_name = self.clean_filename(filename)
            
            # Create new filename
            new_filename = f"RuneFlow_Rune_{rune_number}_{clean_name}.json"
            new_file_path = os.path.join(directory, new_filename)
            
            # Check if new filename already exists (shouldn't happen but be safe)
            counter = 1
            while os.path.exists(new_file_path):
                new_filename = f"RuneFlow_Rune_{rune_number}_{clean_name}_{counter}.json"
                new_file_path = os.path.join(directory, new_filename)
                counter += 1
            
            # Update internal metadata first
            metadata_updated = self.update_template_metadata(file_path, rune_number)
            
            # Rename the file
            os.rename(file_path, new_file_path)
            
            # Record the renaming
            self.renamed_files[file_path] = {
                'new_path': new_file_path,
                'rune_number': rune_number,
                'original_name': filename,
                'new_name': new_filename,
                'metadata_updated': metadata_updated
            }
            
            print(f"✅ Renamed: {filename}")
            print(f"   → RuneFlow_Rune_{rune_number}_{clean_name}.json")
            
            self.stats['files_renamed'] += 1
            if metadata_updated:
                self.stats['files_updated'] += 1
            
            return True
            
        except Exception as e:
            error_msg = f"Error renaming {file_path}: {e}"
            self.errors.append(error_msg)
            print(f"❌ {error_msg}")
            self.stats['errors'] += 1
            return False

    def create_mapping_file(self):
        """Create a mapping file to track all renamings."""
        try:
            mapping_data = {
                'renaming_date': datetime.now().isoformat(),
                'total_files_renamed': self.stats['files_renamed'],
                'rune_range': f"0001-{self.rune_counter-1:04d}",
                'renamed_files': {}
            }
            
            for original_path, info in self.renamed_files.items():
                mapping_data['renamed_files'][info['rune_number']] = {
                    'original_path': original_path,
                    'new_path': info['new_path'],
                    'original_name': info['original_name'],
                    'new_name': info['new_name'],
                    'metadata_updated': info['metadata_updated']
                }
            
            mapping_file = f"RuneFlow_Rune_Mapping_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(mapping_file, 'w', encoding='utf-8') as f:
                json.dump(mapping_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n📋 Created mapping file: {mapping_file}")
            return mapping_file
            
        except Exception as e:
            error_msg = f"Error creating mapping file: {e}"
            self.errors.append(error_msg)
            print(f"❌ {error_msg}")
            return None

    def process_all_templates(self, base_path="."):
        """Process and rename all template files."""
        print("🔍 Finding template files...")
        template_files = self.find_template_files(base_path)
        
        print(f"📁 Found {len(template_files)} template files to rename")
        print(f"🔢 Starting Rune numbering from Rune 0001")
        print("\n🚀 Starting file renaming...\n")
        
        for file_path in sorted(template_files):  # Sort for consistent ordering
            self.stats['files_processed'] += 1
            self.rename_file(file_path)
        
        # Create mapping file
        mapping_file = self.create_mapping_file()
        
        # Print summary
        print(f"\n📊 Renaming Summary:")
        print(f"   Files processed: {self.stats['files_processed']}")
        print(f"   Files renamed: {self.stats['files_renamed']}")
        print(f"   Metadata updated: {self.stats['files_updated']}")
        print(f"   Errors encountered: {self.stats['errors']}")
        print(f"   Rune range: 0001-{self.rune_counter-1:04d}")
        
        if self.errors:
            print(f"\n⚠️  Errors encountered:")
            for error in self.errors[:10]:  # Show first 10 errors
                print(f"   - {error}")
            if len(self.errors) > 10:
                print(f"   ... and {len(self.errors) - 10} more errors")
        
        if mapping_file:
            print(f"\n✅ All files successfully renamed with RuneFlow Rune numbers!")
            print(f"📋 Mapping file created: {mapping_file}")
        
        return self.stats

def main():
    """Main function to run the RuneFlow renamer."""
    print("🔥 RuneFlow Template Renamer with Rune Numbers 🔥")
    print("=" * 60)
    
    renamer = RuneFlowRenamer()
    
    # Show preview of what will happen
    template_files = renamer.find_template_files()
    
    print(f"This script will rename {len(template_files)} template files:")
    print(f"  Format: RuneFlow_Rune_XXXX_original_name.json")
    print(f"  Range: Rune 0001 to Rune {len(template_files):04d}")
    print(f"  Also updates internal metadata with Rune numbers")
    
    response = input(f"\nProceed with renaming {len(template_files)} files? (y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("❌ Operation cancelled.")
        return
    
    # Process all templates
    stats = renamer.process_all_templates()
    
    if stats['errors'] > 0:
        print(f"\n⚠️  Warning: {stats['errors']} errors encountered during processing.")
        print("Check the output above for details.")
    else:
        print(f"\n🎉 Successfully completed renaming all template files!")

if __name__ == "__main__":
    main()
