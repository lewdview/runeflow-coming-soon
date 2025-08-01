import os
import json
import shutil

# Define paths
template_path = './templates/runeflow_numbered_templates/'
core_path = './RUNERUSH_CORE_UPDATED/'
pro_path = './RUNERUSH_PRO_UPDATED/'
complete_path = './RUNERUSH_COMPLETE_UPDATED/'

# Ensure target directories exist
os.makedirs(core_path, exist_ok=True)
os.makedirs(pro_path, exist_ok=True)
os.makedirs(complete_path, exist_ok=True)

# Define sale tiers
core_limit = 50
pro_limit = 50

# Create manifests
core_manifest = []
pro_manifest = []
complete_manifest = []

# Read all template files recursively (filter out system files and non-JSON files)
all_templates = []
for root, dirs, files in os.walk(template_path):
    for file in files:
        if (file.endswith('.json') 
            and not file.startswith('._')
            and not file.startswith('.')):
            all_templates.append(os.path.join(root, file))

print(f"Found {len(all_templates)} valid template files")

# Sort templates to ensure deterministic package
all_templates.sort()

# Copy and categorize templates
for idx, template_path_full in enumerate(all_templates):
    try:
        with open(template_path_full, 'r', encoding='utf-8', errors='ignore') as file:
            data = json.load(file)
            
            # Get just the filename for metadata
            template_filename = os.path.basename(template_path_full)
            
            # Extract rune number from filename if not in data
            rune_number = data.get('rune_number')
            if not rune_number and 'RuneFlow_Rune_' in template_filename:
                try:
                    rune_number = int(template_filename.split('_')[2])
                except:
                    rune_number = idx + 1
            
            metadata = {
                'file_name': template_filename,
                'rune_number': rune_number or (idx + 1),
                'nodes': data.get('nodes', []),
                'node_count': len(data.get('nodes', [])),
                'complexity': data.get('meta', {}).get('complexity', 'Unknown'),
                'platforms': data.get('meta', {}).get('platforms', [])
            }
            complete_manifest.append(metadata)
            
            # Copy to appropriate directories
            if idx < core_limit:
                shutil.copy2(template_path_full, core_path)
                core_manifest.append(metadata)
            elif idx < core_limit + pro_limit:
                shutil.copy2(template_path_full, pro_path)
                pro_manifest.append(metadata)
                
            # Always copy to complete
            shutil.copy2(template_path_full, complete_path)
            
    except Exception as e:
        print(f"Skipping {template}: {e}")
        continue

# Save manifests
with open('RUNERUSH_CORE_manifest.json', 'w') as f:
    json.dump(core_manifest, f, indent=4)

with open('RUNERUSH_PRO_manifest.json', 'w') as f:
    json.dump(pro_manifest, f, indent=4)

with open('RUNERUSH_COMPLETE_manifest.json', 'w') as f:
    json.dump(complete_manifest, f, indent=4)

# Create zip packages
shutil.make_archive('RUNERUSH_CORE', 'zip', core_path)
shutil.make_archive('RUNERUSH_PRO', 'zip', pro_path)
shutil.make_archive('RUNERUSH_COMPLETE', 'zip', complete_path)

print("Packages created successfully!")
