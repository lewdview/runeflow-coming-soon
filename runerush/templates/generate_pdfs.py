#!/usr/bin/env python3
"""
Generate PDF files for each bundle using README content.
"""

import os
import glob
from pathlib import Path
from fpdf import FPDF


def read_content(file_path):
    """Read the content of the README file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()


def save_pdf(content, pdf_path, title):
    """Save the content to a PDF file."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Add a title
    pdf.cell(200, 10, txt=title, ln=1, align='C')
    pdf.ln(10)
    
    # Add the README content
    pdf.multi_cell(0, 10, content)
    
    pdf.output(pdf_path)


def generate_pdfs(directory, output_dir):
    """Generate PDFs for all README files in a directory."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    readme_files = glob.glob(f"{directory}/*_README.md")
    
    for readme_file in readme_files:
        content = read_content(readme_file)
        base_name = Path(readme_file).stem.replace("_README", "")
        title = "Bundle Information: " + base_name.replace("_", " ")
        pdf_path = os.path.join(output_dir, base_name + ".pdf")
        
        save_pdf(content, pdf_path, title)
        print(f"Generated PDF: {pdf_path}")


def main():
    """Main function to generate PDFs for each bundle."""
    print("=== Generating PDFs for Each Bundle ===")
    
    generate_pdfs('RUNERUSH_CORE_ENHANCED', 'RUNERUSH_CORE_PDFS')
    generate_pdfs('RUNERUSH_PRO_ENHANCED', 'RUNERUSH_PRO_PDFS')

    print("\n=== PDF Generation Complete ===")


if __name__ == "__main__":
    main()

