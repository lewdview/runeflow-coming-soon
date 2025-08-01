import os
import json

# Paths for collections
core_path = './RUNERUSH_CORE_UPDATED/'
pro_path = './RUNERUSH_PRO_UPDATED/'

# Define function to create README for each template

def create_readme(template_dir, template_info):
    """Create README based on template info."""
    readme_content = f"""## {template_info['name']}

- **Rune Number**: {template_info['rune_number']}
- **Filename**: {template_info['filename']}
- **Complexity**: {template_info['complexity']}
- **Platform**: {template_info['platform']}
- **Category**: {template_info['category']}
- **Node Count**: {template_info['node_count']}

### Description
{template_info['description']}

### Summary
An example workflow showcasing {template_info['description']}. Designed for use with {template_info['platform']} to streamline {template_info['category'].lower()} tasks.

### Usage
1. Import the template into your RuneFlow setup.
2. Follow the provided instructions to configure any platform-specific settings.
3. Run the workflow and monitor the results.

"""
    readme_path = os.path.join(template_dir, os.path.splitext(template_info['filename'])[0] + '_README.md')
    with open(readme_path, 'w') as readme_file:
        readme_file.write(readme_content)

# Load summaries to get templates
summaries = ['RUNERUSH_CORE_UPDATED_summary.json', 'RUNERUSH_PRO_UPDATED_summary.json']

for summary_file in summaries:
    with open(summary_file, 'r') as f:
        summary_data = json.load(f)
        
        for template in summary_data['templates']:
            
            # Determine target collection path
            target_path = core_path if 'CORE' in summary_file else pro_path
            
            # Create README
            create_readme(target_path, template)
