#!/usr/bin/env python3
"""
Analyze RuneFlow templates and categorize them for HTML table updates
"""

import os
import json
import re
from collections import defaultdict

def parse_template_filename(filename):
    """Parse template filename to extract metadata"""
    # Remove extension
    name = filename.replace('.json', '')
    
    # Extract rune number
    rune_match = re.search(r'Rune_(\d+)', name)
    rune_num = rune_match.group(1) if rune_match else "000"
    
    # Split by underscores and find key components
    parts = name.split('_')
    
    # Find the title (usually starts after the rune number)
    title_start = 0
    for i, part in enumerate(parts):
        if 'Rune' in part and part.endswith(rune_num):
            title_start = i + 1
            break
    
    # Extract title (until we hit category markers)
    title_parts = []
    category = "General"
    complexity = "Basic"
    integration = "Manual"
    
    # Category mapping
    category_keywords = {
        'AIProcessing': 'AI & Research',
        'EmailAutomation': 'Email & Outreach', 
        'TelegramBot': 'Social Media & Content',
        'SlackIntegration': 'Social Media & Content',
        'SlackNotifications': 'Social Media & Content',
        'DatabaseOps': 'Automation & Ops',
        'WebhookHandling': 'Automation & Ops',
        'ScheduledTasks': 'Automation & Ops',
        'ProcessAutomation': 'Automation & Ops',
        'Automation': 'Automation & Ops'
    }
    
    # Extract metadata from filename parts
    for i, part in enumerate(parts[title_start:], title_start):
        if part in category_keywords:
            category = category_keywords[part]
            # Title is everything before this part
            title_parts = parts[title_start:i]
            # Look for complexity and integration in remaining parts
            remaining = parts[i+1:]
            if remaining:
                if remaining[0] in ['Basic', 'Standard', 'Advanced', 'Enterprise']:
                    complexity = remaining[0]
                if len(remaining) > 1:
                    integration = remaining[1]
            break
        elif part in ['Basic', 'Standard', 'Advanced', 'Enterprise']:
            complexity = part
        elif part in category_keywords:
            category = category_keywords[part]
    
    # If no category found in parts, try to infer from title
    if category == "General":
        title_lower = ' '.join(title_parts).lower()
        if any(word in title_lower for word in ['ai', 'chatbot', 'openai', 'llm', 'gpt']):
            category = 'AI & Research'
        elif any(word in title_lower for word in ['email', 'gmail', 'mail']):
            category = 'Email & Outreach'
        elif any(word in title_lower for word in ['telegram', 'slack', 'social', 'twitter', 'instagram']):
            category = 'Social Media & Content'
        elif any(word in title_lower for word in ['database', 'webhook', 'schedule', 'automation']):
            category = 'Automation & Ops'
        elif any(word in title_lower for word in ['woocommerce', 'shopify', 'stripe', 'payment', 'ecommerce']):
            category = 'E-commerce'
    
    # Clean up title
    title = ' '.join(title_parts).replace('_', ' ')
    if not title:
        # Fallback: use everything after rune number until category
        for i, part in enumerate(parts):
            if 'Rune' in part:
                next_parts = []
                for j in range(i+1, len(parts)):
                    if parts[j] in category_keywords or parts[j] in ['Basic', 'Standard', 'Advanced', 'Enterprise']:
                        break
                    next_parts.append(parts[j])
                title = ' '.join(next_parts).replace('_', ' ')
                break
    
    return {
        'rune_number': int(rune_num),
        'title': title,
        'category': category,
        'complexity': complexity,
        'integration': integration,
        'filename': filename
    }

def analyze_templates(directory):
    """Analyze all templates in the directory"""
    templates = []
    
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            template_info = parse_template_filename(filename)
            templates.append(template_info)
    
    # Sort by rune number
    templates.sort(key=lambda x: x['rune_number'])
    
    return templates

def categorize_templates(templates):
    """Group templates by category"""
    categories = defaultdict(list)
    
    for template in templates:
        categories[template['category']].append(template)
    
    return dict(categories)

def generate_html_updates(categories):
    """Generate HTML table updates for each category"""
    html_updates = {}
    
    category_icons = {
        'AI & Research': '🤖',
        'Email & Outreach': '💌', 
        'E-commerce': '🛒',
        'Automation & Ops': '⚙️',
        'Social Media & Content': '📱'
    }
    
    for category, templates in categories.items():
        icon = category_icons.get(category, '📋')
        template_count = len(templates)
        
        # Generate template items (show first 4, then indicate more)
        template_items = []
        for i, template in enumerate(templates[:4]):
            template_items.append(f'<div class="template-item">{template["title"]}</div>')
        
        if len(templates) > 4:
            remaining = len(templates) - 4
            template_items.append(f'<div class="template-item-more">+ {remaining} more premium {category.lower()} templates...</div>')
        
        html_updates[category] = {
            'icon': icon,
            'count': template_count,
            'template_items': template_items,
            'all_templates': templates
        }
    
    return html_updates

def main():
    """Main function"""
    template_dir = "FINAL_COLLECTIONS/RUNERUSH_CORE_ENHANCED"
    
    if not os.path.exists(template_dir):
        print(f"Directory {template_dir} not found!")
        return
    
    print("Analyzing templates...")
    templates = analyze_templates(template_dir)
    print(f"Found {len(templates)} templates")
    
    print("\nCategorizing templates...")
    categories = categorize_templates(templates)
    
    print("\nTemplate breakdown by category:")
    for category, template_list in categories.items():
        print(f"  {category}: {len(template_list)} templates")
    
    print("\nGenerating HTML updates...")
    html_updates = generate_html_updates(categories)
    
    # Save results to JSON for easy use
    with open('template_analysis.json', 'w') as f:
        json.dump({
            'templates': templates,
            'categories': categories,
            'html_updates': html_updates
        }, f, indent=2, default=str)
    
    print("Analysis complete! Results saved to template_analysis.json")
    
    # Print sample HTML for one category
    if 'AI & Research' in html_updates:
        ai_category = html_updates['AI & Research']
        print(f"\nSample HTML for AI & Research ({ai_category['count']} templates):")
        print('<div class="category-card category-ai">')
        print('    <div class="category-header">')
        print(f'        <div class="category-icon"><span>{ai_category["icon"]}</span></div>')
        print('        <div>')
        print('            <h3>AI & Research</h3>')
        print(f'            <p>{ai_category["count"]} Premium Templates</p>')
        print('        </div>')
        print('    </div>')
        print('    <p class="category-description">High-demand AI automation that customers desperately want.</p>')
        print('    <div class="template-grid">')
        for item in ai_category['template_items']:
            print(f'        {item}')
        print('    </div>')
        print('</div>')

if __name__ == "__main__":
    main()
