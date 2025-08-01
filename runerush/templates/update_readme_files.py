#!/usr/bin/env python3
"""
Update README files to match the enhanced template names.
"""

import os
import shutil
from pathlib import Path
import glob

def update_readme_files():
    """Update README files for all enhanced collections."""
    
    # Define the collections
    collections = [
        ('RUNERUSH_CORE_UPDATED', 'RUNERUSH_CORE_ENHANCED'),
        ('RUNERUSH_PRO_UPDATED', 'RUNERUSH_PRO_ENHANCED'),
        ('templates/RUNERUSH_COMPLETE_VAULT', 'RUNERUSH_COMPLETE_ENHANCED')  # Assuming READMEs exist here too
    ]
    
    for source_dir, target_dir in collections:
        print(f"\nProcessing {source_dir} -> {target_dir}")
        
        if not os.path.exists(source_dir):
            print(f"Source directory {source_dir} does not exist")
            continue
            
        if not os.path.exists(target_dir):
            print(f"Target directory {target_dir} does not exist")
            continue
        
        # Get all README files from source
        readme_files = glob.glob(f"{source_dir}/*_README.md")
        print(f"Found {len(readme_files)} README files in {source_dir}")
        
        updated_count = 0
        
        for readme_file in readme_files:
            # Extract the base name (everything before _README.md)
            base_name = Path(readme_file).stem.replace('_README', '')
            
            # Extract just the rune number to match enhanced files
            # Example: RuneFlow_Rune_0001_Something -> RuneFlow_Rune_0001
            parts = base_name.split('_')
            if len(parts) >= 3 and parts[0] == 'RuneFlow' and parts[1] == 'Rune':
                rune_prefix = '_'.join(parts[:3])  # RuneFlow_Rune_XXXX
                # Find matching JSON file in target directory by rune number
                json_files = glob.glob(f"{target_dir}/{rune_prefix}_*.json")
            else:
                # Fallback to original matching
                json_files = glob.glob(f"{target_dir}/{base_name}*.json")
            
            if json_files:
                # Use the first match (should only be one)
                json_file = json_files[0]
                json_base = Path(json_file).stem
                
                # Create new README path
                new_readme_path = f"{target_dir}/{json_base}_README.md"
                
                # Copy the README file
                try:
                    shutil.copy2(readme_file, new_readme_path)
                    print(f"  ✓ Updated: {Path(readme_file).name} -> {Path(new_readme_path).name}")
                    updated_count += 1
                except Exception as e:
                    print(f"  ✗ Error copying {readme_file}: {e}")
            else:
                print(f"  ⚠ No matching JSON found for: {base_name}")
        
        print(f"Updated {updated_count} README files in {target_dir}")

if __name__ == "__main__":
    print("=== Updating README Files to Match Enhanced Names ===")
    update_readme_files()
    print("\n=== README Update Complete ===")
