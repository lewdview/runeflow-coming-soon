#!/usr/bin/env python3
"""
Clean up the project by removing unneeded files and organizing the final structure.
"""

import os
import shutil
import glob

def remove_items(items, description):
    """Remove files or directories from the list."""
    print(f"\nRemoving {description}...")
    removed_count = 0
    
    for item in items:
        if os.path.exists(item):
            try:
                if os.path.isdir(item):
                    shutil.rmtree(item)
                else:
                    os.remove(item)
                print(f"  ✓ Removed: {item}")
                removed_count += 1
            except Exception as e:
                print(f"  ✗ Error removing {item}: {e}")
        else:
            print(f"  - Not found: {item}")
    
    print(f"Total {description} removed: {removed_count}")

def create_final_structure():
    """Create the final organized structure."""
    print("\n=== Creating Final Project Structure ===")
    
    # Create a FINAL_COLLECTIONS directory
    final_dir = "FINAL_COLLECTIONS"
    if not os.path.exists(final_dir):
        os.makedirs(final_dir)
        print(f"Created: {final_dir}")
    
    # Move essential items to final collections
    essential_items = [
        ("RUNERUSH_CORE_ENHANCED", f"{final_dir}/RUNERUSH_CORE_ENHANCED"),
        ("RUNERUSH_PRO_ENHANCED", f"{final_dir}/RUNERUSH_PRO_ENHANCED"), 
        ("RUNERUSH_COMPLETE_ENHANCED", f"{final_dir}/RUNERUSH_COMPLETE_ENHANCED"),
        ("RUNERUSH_CORE_PDFS", f"{final_dir}/RUNERUSH_CORE_PDFS"),
        ("RUNERUSH_PRO_PDFS", f"{final_dir}/RUNERUSH_PRO_PDFS"),
        ("TASK_COMPLETION_SUMMARY.md", f"{final_dir}/TASK_COMPLETION_SUMMARY.md"),
        ("naming_improvements_manifest.json", f"{final_dir}/naming_improvements_manifest.json")
    ]
    
    for source, dest in essential_items:
        if os.path.exists(source):
            try:
                if os.path.exists(dest):
                    if os.path.isdir(dest):
                        shutil.rmtree(dest)
                    else:
                        os.remove(dest)
                shutil.move(source, dest)
                print(f"  ✓ Moved: {source} -> {dest}")
            except Exception as e:
                print(f"  ✗ Error moving {source}: {e}")
        else:
            print(f"  - Not found: {source}")

def main():
    """Main cleanup function."""
    print("=== RUNERUSH Project Cleanup ===")
    
    # Files and directories to remove
    obsolete_directories = [
        "RUNERUSH_COMPLETE",
        "RUNERUSH_CORE", 
        "RUNERUSH_PRO",
        "RUNERUSH_CORE_UPDATED",
        "RUNERUSH_PRO_UPDATED", 
        "RUNERUSH_COMPLETE_UPDATED"
    ]
    
    obsolete_files = [
        "RUNERUSH_CORE_manifest.json",
        "RUNERUSH_PRO_manifest.json",
        "RUNERUSH_COMPLETE_manifest.json",
        "RUNERUSH_CORE_UPDATED_summary.json",
        "RUNERUSH_PRO_UPDATED_summary.json",
        "RUNERUSH_COMPLETE_UPDATED_summary.json",
        "RUNERUSH_CORE_UPDATED.zip",
        "RUNERUSH_PRO_UPDATED.zip"
    ]
    
    # Remove Mac system files (._files)
    system_files = glob.glob("._RUNERUSH*")
    
    # Remove obsolete items
    remove_items(obsolete_directories, "obsolete directories")
    remove_items(obsolete_files, "obsolete files")
    remove_items(system_files, "Mac system files")
    
    # Clean up templates directory
    print("\nCleaning templates directory...")
    template_obsolete = [
        "templates/RUNERUSH_CORE_50",
        "templates/RUNERUSH_PRO_UPGRADE_50", 
        "templates/RUNERUSH_CORE_50.zip",
        "templates/RUNERUSH_PRO_UPGRADE_50.zip",
        "templates/RUNERUSH_CORE_50_manifest.json",
        "templates/RUNERUSH_PRO_UPGRADE_50_manifest.json"
    ]
    
    remove_items(template_obsolete, "obsolete template files")
    
    # Create final organized structure
    create_final_structure()
    
    print("\n=== Cleanup Summary ===")
    print("✅ Removed obsolete directories and files")
    print("✅ Cleaned up Mac system files")
    print("✅ Organized final collections structure")
    print("\n📁 Final Structure:")
    print("   FINAL_COLLECTIONS/")
    print("   ├── RUNERUSH_CORE_ENHANCED/")
    print("   ├── RUNERUSH_PRO_ENHANCED/") 
    print("   ├── RUNERUSH_COMPLETE_ENHANCED/")
    print("   ├── RUNERUSH_CORE_PDFS/")
    print("   ├── RUNERUSH_PRO_PDFS/")
    print("   ├── TASK_COMPLETION_SUMMARY.md")
    print("   └── naming_improvements_manifest.json")
    print("\n🎉 Project cleanup complete!")

if __name__ == "__main__":
    main()
