#!/bin/bash

# Define source and destination directories
SOURCE_DIR="/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_runeflow_organized"
TEMPLATE_DIR="templates"

# Function to copy and zip files
create_zip() {
    local template_source="$1"
    local destination_dir="$2"
    local zip_name="$3"
    
    # Create destination directory if it doesn't exist
    mkdir -p "${TEMPLATE_DIR}/${destination_dir}"

    # Copy templates from source to destination
    cp "${SOURCE_DIR}/${template_source}"/* "${TEMPLATE_DIR}/${destination_dir}"

    # Create zip archive
    cd "${TEMPLATE_DIR}/${destination_dir}"
    zip -r "../${zip_name}.zip" *
    cd - > /dev/null

    echo "Created ${zip_name}.zip with templates from ${template_source}"
}

# Create core templates zip
create_zip "AI_Research" "core" "runerush-core-50-templates"

# Extend this script to include pro, complete, and legacy with appropriate directories and zips
# e.g. create_zip "Pro_Source_Category" "pro" "runerush-pro-advanced-50-templates"
