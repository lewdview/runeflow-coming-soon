#!/usr/bin/env python3
"""
Update index.html with actual templates from FINAL_COLLECTIONS/RUNERUSH_CORE_ENHANCED
"""

import json
import re

def clean_title(title):
    """Clean up template titles for display"""
    # Remove the "RuneFlow Rune XXXX" prefix
    cleaned = re.sub(r'^RuneFlow Rune \d+ ', '', title)
    
    # If title is still too long, truncate intelligently
    if len(cleaned) > 60:
        # Find a good break point
        if '(' in cleaned:
            cleaned = cleaned.split('(')[0].strip()
        elif '-' in cleaned:
            parts = cleaned.split('-')
            cleaned = parts[0].strip()
        elif len(cleaned) > 80:
            cleaned = cleaned[:60] + '...'
    
    return cleaned

def update_html_file():
    """Update the HTML file with actual template data"""
    
    # Load the analysis data
    with open('template_analysis.json', 'r') as f:
        data = json.load(f)
    
    # Read the current HTML file
    with open('index.html', 'r') as f:
        html_content = f.read()
    
    # Update the template count summary (50 templates, but actual count now)
    html_content = re.sub(
        r'<div style="font-size: 36px; font-weight: 900; color: #4caf50.*?">50</div>',
        f'<div style="font-size: 36px; font-weight: 900; color: #4caf50; text-shadow: 0 0 15px rgba(76, 175, 80, 0.5);">{len(data["templates"])}</div>',
        html_content
    )
    
    # Update category counts (number from 5 to 4 since we only have 4 categories now)
    category_count = len([cat for cat in data['categories'].keys() if cat != 'E-commerce'])
    html_content = re.sub(
        r'<div style="font-size: 36px; font-weight: 900; color: #ff6b35.*?">5</div>',
        f'<div style="font-size: 36px; font-weight: 900; color: #ff6b35; text-shadow: 0 0 15px rgba(255, 107, 53, 0.5);">{category_count}</div>',
        html_content
    )
    
    # Update each category section
    category_updates = {
        'AI & Research': {
            'count': len(data['categories']['AI & Research']),
            'templates': [clean_title(t['title']) for t in data['categories']['AI & Research'][:4]],
            'more_count': max(0, len(data['categories']['AI & Research']) - 4)
        },
        'Email & Outreach': {
            'count': len(data['categories']['Email & Outreach']),
            'templates': [clean_title(t['title']) for t in data['categories']['Email & Outreach'][:4]],
            'more_count': max(0, len(data['categories']['Email & Outreach']) - 4)
        },
        'Automation & Ops': {
            'count': len(data['categories']['Automation & Ops']),
            'templates': [clean_title(t['title']) for t in data['categories']['Automation & Ops'][:4]],
            'more_count': max(0, len(data['categories']['Automation & Ops']) - 4)
        },
        'Social Media & Content': {
            'count': len(data['categories']['Social Media & Content']),
            'templates': [clean_title(t['title']) for t in data['categories']['Social Media & Content'][:4]],
            'more_count': max(0, len(data['categories']['Social Media & Content']) - 4)
        }
    }
    
    # Update AI & Research section
    ai_section = f'''                    <!-- AI & Research -->
                    <div class="category-card category-ai">
                        <div class="category-header">
                            <div class="category-icon"><span>🤖</span></div>
                            <div>
                                <h3>AI & Research</h3>
                                <p>{category_updates["AI & Research"]["count"]} Premium Templates</p>
                            </div>
                        </div>
                        <p class="category-description">High-demand AI automation that customers desperately want.</p>
                        <div class="template-grid">'''
    
    for template in category_updates["AI & Research"]["templates"]:
        ai_section += f'\n                            <div class="template-item">{template}</div>'
    
    if category_updates["AI & Research"]["more_count"] > 0:
        ai_section += f'\n                            <div class="template-item-more">+ {category_updates["AI & Research"]["more_count"]} more premium AI templates...</div>'
    
    ai_section += '''
                        </div>
                    </div>'''
    
    # Replace AI section
    ai_pattern = r'(\s*)<!-- AI & Research -->.*?</div>\s*</div>'
    html_content = re.sub(ai_pattern, ai_section, html_content, flags=re.DOTALL)
    
    # Update Email & Outreach section
    email_section = f'''                    <!-- Email & Outreach -->
                    <div class="category-card category-email">
                        <div class="category-header">
                            <div class="category-icon"><span>💌</span></div>
                            <div>
                                <h3>Email & Outreach</h3>
                                <p>{category_updates["Email & Outreach"]["count"]} Premium Templates</p>
                            </div>
                        </div>
                        <p class="category-description">Automate your email marketing, follow-ups, and notifications.</p>
                        <div class="template-grid">'''
    
    for template in category_updates["Email & Outreach"]["templates"]:
        email_section += f'\n                            <div class="template-item">{template}</div>'
    
    if category_updates["Email & Outreach"]["more_count"] > 0:
        email_section += f'\n                            <div class="template-item-more">+ {category_updates["Email & Outreach"]["more_count"]} more premium email templates...</div>'
    
    email_section += '''
                        </div>
                    </div>'''
    
    # Replace Email section
    email_pattern = r'(\s*)<!-- Email & Outreach -->.*?</div>\s*</div>'
    html_content = re.sub(email_pattern, email_section, html_content, flags=re.DOTALL)
    
    # Remove E-commerce section since we don't have any e-commerce templates in core collection
    ecommerce_pattern = r'(\s*)<!-- E-commerce -->.*?</div>\s*</div>'
    html_content = re.sub(ecommerce_pattern, '', html_content, flags=re.DOTALL)
    
    # Update Automation & Ops section
    automation_section = f'''                    <!-- Automation & Ops -->
                    <div class="category-card category-automation">
                        <div class="category-header">
                            <div class="category-icon"><span>⚙️</span></div>
                            <div>
                                <h3>Automation & Ops</h3>
                                <p>{category_updates["Automation & Ops"]["count"]} Premium Templates</p>
                            </div>
                        </div>
                        <p class="category-description">Optimize your business processes and internal workflows.</p>
                        <div class="template-grid">'''
    
    for template in category_updates["Automation & Ops"]["templates"]:
        automation_section += f'\n                            <div class="template-item">{template}</div>'
    
    if category_updates["Automation & Ops"]["more_count"] > 0:
        automation_section += f'\n                            <div class="template-item-more">+ {category_updates["Automation & Ops"]["more_count"]} more premium automation templates...</div>'
    
    automation_section += '''
                        </div>
                    </div>'''
    
    # Replace Automation section
    automation_pattern = r'(\s*)<!-- Automation & Ops -->.*?</div>\s*</div>'
    html_content = re.sub(automation_pattern, automation_section, html_content, flags=re.DOTALL)
    
    # Update Social Media & Content section
    social_section = f'''                    <!-- Social Media & Content -->
                    <div class="category-card category-social">
                        <div class="category-header">
                            <div class="category-icon"><span>📱</span></div>
                            <div>
                                <h3>Social Media & Content</h3>
                                <p>{category_updates["Social Media & Content"]["count"]} Premium Templates</p>
                            </div>
                        </div>
                        <p class="category-description">Automate your content pipeline and social media presence.</p>
                        <div class="template-grid">'''
    
    for template in category_updates["Social Media & Content"]["templates"]:
        social_section += f'\n                            <div class="template-item">{template}</div>'
    
    if category_updates["Social Media & Content"]["more_count"] > 0:
        social_section += f'\n                            <div class="template-item-more">+ {category_updates["Social Media & Content"]["more_count"]} more premium social media templates...</div>'
    
    social_section += '''
                        </div>
                    </div>'''
    
    # Replace Social section
    social_pattern = r'(\s*)<!-- Social Media & Content -->.*?</div>\s*</div>'
    html_content = re.sub(social_pattern, social_section, html_content, flags=re.DOTALL)
    
    # Write the updated content back to the file
    with open('index.html', 'w') as f:
        f.write(html_content)
    
    print("✅ Successfully updated index.html with actual template data!")
    print(f"📊 Updated template counts:")
    for category, info in category_updates.items():
        print(f"   {category}: {info['count']} templates")

if __name__ == '__main__':
    update_html_file()
