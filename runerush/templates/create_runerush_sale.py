#!/usr/bin/env python3
"""
Create RUNERUSH Sale Event Collections

RUNERUSH CORE: 50 top essential templates
RUNERUSH PRO UPGRADE: 50 additional advanced templates  
RUNERUSH COMPLETE VAULT: All 8,142 templates
"""

import json
import os
import glob
import shutil
import re
from datetime import datetime

def create_runerush_collections():
    """Create the three RUNERUSH sale collections."""
    
    # Create directories
    os.makedirs('RUNERUSH_CORE_50', exist_ok=True)
    os.makedirs('RUNERUSH_PRO_UPGRADE_50', exist_ok=True) 
    os.makedirs('RUNERUSH_COMPLETE_VAULT', exist_ok=True)
    
    print("🔥 RUNERUSH SALE EVENT - Creating Collections 🔥")
    print("=" * 60)
    
    # Load existing categorizations
    with open('runeflow_core_collection_summary.json', 'r') as f:
        core_data = json.load(f)
    
    with open('runeflow_pro_collection_summary.json', 'r') as f:
        pro_data = json.load(f)
    
    # RUNERUSH CORE: Top 50 from Core collection
    print("Creating RUNERUSH CORE (50 templates)...")
    core_templates = core_data['templates'][:50]  # Take top 50
    
    runerush_core = {
        "collection": "RUNERUSH CORE 50",
        "description": "50 Essential Automation Templates - Perfect for Getting Started",
        "sale_tier": "core",
        "template_count": 50,
        "created": datetime.now().isoformat(),
        "features": [
            "Essential webhook processing",
            "Basic notifications (Slack, Email)",
            "Simple data integrations", 
            "Core business workflows",
            "Beginner-friendly templates"
        ],
        "templates": []
    }
    
    for template in core_templates:
        # Copy file
        src_file = f"runeflow_core_collection/{template['filename']}"
        dst_file = f"RUNERUSH_CORE_50/{template['filename']}"
        if os.path.exists(src_file):
            shutil.copy2(src_file, dst_file)
            runerush_core["templates"].append(template)
    
    # RUNERUSH PRO UPGRADE: Top 50 from Pro collection
    print("Creating RUNERUSH PRO UPGRADE (additional 50 templates)...")
    # Select top 50 Pro templates by quality and features
    pro_templates = sorted(pro_data['templates'], 
                          key=lambda x: (x.get('quality_score', 5), x.get('advanced_features', 0)), 
                          reverse=True)[:50]
    
    runerush_pro = {
        "collection": "RUNERUSH PRO UPGRADE 50", 
        "description": "50 Advanced Templates - Upgrade Your Automation Game",
        "sale_tier": "pro_upgrade",
        "template_count": 50,
        "created": datetime.now().isoformat(),
        "features": [
            "AI-powered automations",
            "Advanced database operations",
            "Multi-platform integrations",
            "Complex business logic",
            "Enterprise-grade workflows"
        ],
        "templates": []
    }
    
    for template in pro_templates:
        # Copy file
        src_file = f"runeflow_pro_collection/{template['filename']}"
        dst_file = f"RUNERUSH_PRO_UPGRADE_50/{template['filename']}"
        if os.path.exists(src_file):
            shutil.copy2(src_file, dst_file)
            runerush_pro["templates"].append(template)
    
    # RUNERUSH COMPLETE VAULT: All templates
    print("Creating RUNERUSH COMPLETE VAULT (all 8,142 templates)...")
    
    runerush_complete = {
        "collection": "RUNERUSH COMPLETE VAULT",
        "description": "Complete Collection - Every Single Template (8,142 Total)",
        "sale_tier": "complete_vault", 
        "template_count": 8142,
        "created": datetime.now().isoformat(),
        "features": [
            "All 8,142 automation templates",
            "Every category and complexity level",
            "AI-powered workflows", 
            "Database integrations",
            "File processing automations",
            "Communication platform integrations",
            "E-commerce workflows",
            "Data analysis templates",
            "Security and monitoring",
            "Complete automation mastery"
        ],
        "core_count": len(core_data['templates']),
        "pro_count": len(pro_data['templates']),
        "templates": "See individual collection summaries for full listings"
    }
    
    # Copy all numbered templates to complete vault
    numbered_files = glob.glob('runeflow_numbered_templates/RuneFlow_Rune_*.json')
    for src_file in numbered_files:
        filename = os.path.basename(src_file)
        dst_file = f"RUNERUSH_COMPLETE_VAULT/{filename}"
        shutil.copy2(src_file, dst_file)
    
    # Save collection manifests
    with open('RUNERUSH_CORE_50_manifest.json', 'w', encoding='utf-8') as f:
        json.dump(runerush_core, f, indent=2, ensure_ascii=False)
    
    with open('RUNERUSH_PRO_UPGRADE_50_manifest.json', 'w', encoding='utf-8') as f:
        json.dump(runerush_pro, f, indent=2, ensure_ascii=False)
    
    with open('RUNERUSH_COMPLETE_VAULT_manifest.json', 'w', encoding='utf-8') as f:
        json.dump(runerush_complete, f, indent=2, ensure_ascii=False)
    
    # Create sale event summary
    sale_summary = {
        "event": "RUNERUSH SALE EVENT",
        "description": "Limited Time Automation Template Sale",
        "created": datetime.now().isoformat(),
        "tiers": {
            "core": {
                "name": "RUNERUSH CORE 50",
                "templates": 50,
                "description": "Essential templates for automation beginners",
                "target_audience": "New to automation, small businesses"
            },
            "pro_upgrade": {
                "name": "RUNERUSH PRO UPGRADE 50", 
                "templates": 50,
                "description": "Advanced templates for power users",
                "target_audience": "Experienced users, growing businesses",
                "note": "Requires CORE purchase"
            },
            "complete_vault": {
                "name": "RUNERUSH COMPLETE VAULT",
                "templates": 8142,
                "description": "Every single automation template",
                "target_audience": "Agencies, enterprises, automation masters"
            }
        },
        "total_unique_templates": 8142
    }
    
    with open('RUNERUSH_SALE_EVENT_summary.json', 'w', encoding='utf-8') as f:
        json.dump(sale_summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ RUNERUSH Sale Collections Created!")
    print(f"📁 RUNERUSH_CORE_50/: {len(runerush_core['templates'])} templates")
    print(f"📁 RUNERUSH_PRO_UPGRADE_50/: {len(runerush_pro['templates'])} templates") 
    print(f"📁 RUNERUSH_COMPLETE_VAULT/: {runerush_complete['template_count']} templates")
    print(f"\n🎯 Sale Event Structure:")
    print(f"   🔷 CORE: Perfect starter pack")
    print(f"   🔶 PRO UPGRADE: Advanced features (add-on)")
    print(f"   💎 COMPLETE VAULT: Everything included")

def create_sale_packages():
    """Create ZIP packages for easy distribution."""
    import zipfile
    
    print("\n📦 Creating distribution packages...")
    
    # RUNERUSH CORE package
    with zipfile.ZipFile('RUNERUSH_CORE_50.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('RUNERUSH_CORE_50'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, 'RUNERUSH_CORE_50')
                zipf.write(file_path, arcname)
        # Add manifest
        zipf.write('RUNERUSH_CORE_50_manifest.json', 'manifest.json')
    
    # RUNERUSH PRO UPGRADE package  
    with zipfile.ZipFile('RUNERUSH_PRO_UPGRADE_50.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('RUNERUSH_PRO_UPGRADE_50'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, 'RUNERUSH_PRO_UPGRADE_50')
                zipf.write(file_path, arcname)
        # Add manifest
        zipf.write('RUNERUSH_PRO_UPGRADE_50_manifest.json', 'manifest.json')
    
    # RUNERUSH COMPLETE VAULT package (this will be large!)
    print("Creating COMPLETE VAULT package (this may take a while)...")
    with zipfile.ZipFile('RUNERUSH_COMPLETE_VAULT.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('RUNERUSH_COMPLETE_VAULT'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, 'RUNERUSH_COMPLETE_VAULT')
                zipf.write(file_path, arcname)
        # Add manifest
        zipf.write('RUNERUSH_COMPLETE_VAULT_manifest.json', 'manifest.json')
        # Add collection summaries
        zipf.write('runeflow_core_collection_summary.json', 'core_collection_summary.json')
        zipf.write('runeflow_pro_collection_summary.json', 'pro_collection_summary.json')
    
    print("✅ Distribution packages created!")
    print("   📦 RUNERUSH_CORE_50.zip")
    print("   📦 RUNERUSH_PRO_UPGRADE_50.zip") 
    print("   📦 RUNERUSH_COMPLETE_VAULT.zip")

def main():
    """Main function."""
    create_runerush_collections()
    
    # Ask about creating packages
    response = input("\n🎁 Create ZIP packages for distribution? (y/N): ").strip().lower()
    if response in ['y', 'yes']:
        create_sale_packages()
    
    print(f"\n🎉 RUNERUSH SALE EVENT READY!")
    print(f"All collections and manifests created successfully!")

if __name__ == "__main__":
    main()
