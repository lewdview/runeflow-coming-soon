#!/usr/bin/env python3
"""
Update index.html with the actual templates from FINAL_COLLECTIONS/core_enhanced
"""
import json
import os

HTML_FILE = 'index.html'
TEMPLATE_JSON = 'template_analysis.json'

CATEGORY_INSERTION_POINTS = {
    'Automation & Ops': '  <!-- Automation & Ops Section -->\n',
    'Social Media & Content': '  <!-- Social Media & Content Section -->\n',
    'Email & Outreach': '  <!-- Email & Outreach Section -->\n',
    'AI & Research': '  <!-- AI & Research Section -->\n',
}


def insert_templates():
    """Insert templates into HTML based on categories"""
    with open(TEMPLATE_JSON, 'r') as f:
        data = json.load(f)

    # Read current HTML content
    with open(HTML_FILE, 'r') as f:
        html_content = f.readlines()

    # Prepare updated HTML content
    updated_html_content = []
    category_processed = {key: False for key in CATEGORY_INSERTION_POINTS.keys()}

    for line in html_content:
        # Check if line is an insertion point
        for category, marker in CATEGORY_INSERTION_POINTS.items():
            if marker.strip() in line.strip() and not category_processed[category]:
                # Insert templates here
                print(f"Inserting templates for category: {category}")
                icon = data['html_updates'][category]['icon']
                count = data['html_updates'][category]['count']
                template_items_html = '\n        '.join(data['html_updates'][category]['template_items'])

                updated_html_content.append(marker)
                updated_html_content.append('    <div class="category-card">
')
                updated_html_content.append(f'        <h3>{icon} {category} ({count} templates)</h3>\n')
                updated_html_content.append('        <div class="template-grid">\n')
                updated_html_content.append(f'{template_items_html}\n')
                updated_html_content.append('        </div>\n    </div>\n')

                category_processed[category] = True
                break
        else:
            updated_html_content.append(line)

    # Write updated HTML content
    with open(HTML_FILE, 'w') as f:
        f.writelines(updated_html_content)

    print(f'Updated {HTML_FILE} with new template data.')


if __name__ == '__main__':
    insert_templates()

