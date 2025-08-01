#!/bin/bash

# Define source and destination directories
SOURCE_DIR="/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_runeflow_organized"
TEMPLATE_DIR="templates/complete"

# Create destination directory
mkdir -p "$TEMPLATE_DIR"

# Copy all templates to the complete directory
cp "$SOURCE_DIR"/*/* "$TEMPLATE_DIR"

# Create complete collection zip
cd "$TEMPLATE_DIR"
zip -r "../runerush-complete-collection.zip" *
cd - > /dev/null

echo "Created runerush-complete-collection.zip with all templates"
