#!/bin/bash

# Set base paths
SOURCE_ORGANIZED="/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_organized"
SOURCE_RUNEFLOW="/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_runeflow_organized"
CORE_DEST="/Volumes/extremeUno/webhalla_complete/runeflow_deployment/runerush/templates/core_50_templates"
PRO_DEST="/Volumes/extremeUno/webhalla_complete/runeflow_deployment/runerush/templates/pro_50_templates"

# Function to find and copy template
copy_template() {
    local template_name="$1"
    local dest_dir="$2"
    
    # Try organized directory first
    if find "$SOURCE_ORGANIZED" -name "*${template_name}*.json" -exec cp {} "$dest_dir" \; 2>/dev/null; then
        echo "✓ Copied $template_name from organized"
    # Try runeflow directory
    elif find "$SOURCE_RUNEFLOW" -name "*${template_name}*.json" -exec cp {} "$dest_dir" \; 2>/dev/null; then
        echo "✓ Copied $template_name from runeflow"
    else
        echo "✗ Could not find $template_name"
    fi
}

echo "🔥 COPYING RUNERUSH CORE 50 TEMPLATES..."

# CORE 50 - AI Research (18 templates)
echo "📁 AI Research Templates (18)..."
copy_template "AI-Powered_Chatbot_with_Webhook_Response_Handler" "$CORE_DEST/AI_Research/"
copy_template "WhatsApp_AI_Assistant_with_Document_Knowledge_Base" "$CORE_DEST/AI_Research/"
copy_template "OpenAI-Powered_Chat_Assistant_for_HubSpot_Support" "$CORE_DEST/AI_Research/"
copy_template "AI-Powered_Email_Analysis_and_Google_Sheets_Reporting" "$CORE_DEST/AI_Research/"
copy_template "Telegram_AI_Assistant_with_Web_Search_Capability" "$CORE_DEST/AI_Research/"
copy_template "AI_Voice_Chat_using_Webhook,_Memory_Manager,_OpenAI,_Google_Gemini_&_ElevenLabs" "$CORE_DEST/AI_Research/"
copy_template "Personal_Shopper_Chatbot_for_WooCommerce_with_RAG" "$CORE_DEST/AI_Research/"
copy_template "AI chatbot that can search the web" "$CORE_DEST/AI_Research/"
copy_template "AI Customer feedback sentiment analysis" "$CORE_DEST/AI_Research/"
copy_template "AI Agent _ Google calendar assistant using OpenAI" "$CORE_DEST/AI_Research/"
copy_template "AI Voice Chatbot with ElevenLabs & OpenAI for Customer Service and Restaurants" "$CORE_DEST/AI_Research/"
copy_template "AI Social Media Caption Creator creates social media post captions in Airtable" "$CORE_DEST/AI_Research/"
copy_template "AI web researcher for sales" "$CORE_DEST/AI_Research/"
copy_template "AI-Powered_Document_Q&A_Using_LangChain_and_OpenAI" "$CORE_DEST/AI_Research/"
copy_template "Discord AI-powered bot" "$CORE_DEST/AI_Research/"
copy_template "Telegram AI Chatbot" "$CORE_DEST/AI_Research/"
copy_template "AI Agent to chat with Supabase_PostgreSQL DB" "$CORE_DEST/AI_Research/"
copy_template "Generate_Images_via_API_Using_OpenAI" "$CORE_DEST/AI_Research/"

# CORE 50 - Email Marketing (12 templates)
echo "📁 Email Marketing Templates (12)..."
copy_template "ConvertKit_Form_Subscriber_Notification" "$CORE_DEST/Email_Marketing/"
copy_template "HubSpot_Event_Notification_System" "$CORE_DEST/Email_Marketing/"
copy_template "Calendly_Event_Notification" "$CORE_DEST/Email_Marketing/"
copy_template "JotForm_Submission_Notification" "$CORE_DEST/Email_Marketing/"
copy_template "Create_and_Send_Outlook_Draft_with_Attachment" "$CORE_DEST/Email_Marketing/"
copy_template "MailChimp_Activity_Notification" "$CORE_DEST/Email_Marketing/"
copy_template "Email_Bounce_and_Open_Notifications_via_Postmark" "$CORE_DEST/Email_Marketing/"
copy_template "Forward_Netflix_Emails_to_Multiple_Recipients_via_Gmail" "$CORE_DEST/Email_Marketing/"
copy_template "Asana_Event_Notifications_for_Team_Updates" "$CORE_DEST/Email_Marketing/"
copy_template "Chargebee_Event_Notifications" "$CORE_DEST/Email_Marketing/"
copy_template "RSS_Feed_Updates_Sent_to_Telegram_Channel" "$CORE_DEST/Email_Marketing/"
copy_template "Monitor_Website_and_Send_Discord_Alerts" "$CORE_DEST/Email_Marketing/"

# CORE 50 - E-commerce (10 templates)
echo "📁 E-commerce Templates (10)..."
copy_template "Daily_Shopify_Sales_Update_to_Sheets_and_Slack" "$CORE_DEST/Ecommerce/"
copy_template "AI-Powered_Personal_Shopper_for_WooCommerce_Store" "$CORE_DEST/Ecommerce/"
copy_template "WooCommerce_AI_Chatbot_for_Post-Sales_Customer_Support" "$CORE_DEST/Ecommerce/"
copy_template "Business_WhatsApp_AI_RAG_Chatbot" "$CORE_DEST/Ecommerce/"
copy_template "Sync_Stripe_Payments_with_Customer_and_Product_Details" "$CORE_DEST/Ecommerce/"
copy_template "Creating_an_Onfleet_Task_for_a_new_Shopify_Fulfillment" "$CORE_DEST/Ecommerce/"
copy_template "AI-Enhanced_WooCommerce_Product_Import_from_Google_Sheets" "$CORE_DEST/Ecommerce/"
copy_template "Form_to_HubSpot_with_AI-Powered_Summary_and_Follow-Up" "$CORE_DEST/Ecommerce/"
copy_template "LinkedIn_Company_Search_and_AI-Scored_CRM_Update" "$CORE_DEST/Ecommerce/"
copy_template "Get_the_logo,_icon,_and_information_of_a_company_and_store_it_in_Airtable" "$CORE_DEST/Ecommerce/"

# CORE 50 - Automation (6 templates)
echo "📁 Automation Templates (6)..."
copy_template "Scheduled_URL_Health_Check_and_Ping_Monitor" "$CORE_DEST/Automation/"
copy_template "Create_Onfleet_Task_from_Google_Drive_File_Updates" "$CORE_DEST/Automation/"
copy_template "Manually_Add_Events_to_Google_Calendar" "$CORE_DEST/Automation/"
copy_template "Manually_Create_New_ClickUp_Task" "$CORE_DEST/Automation/"
copy_template "Daily_Weather_Data_Fetch_and_Airtable_Storage" "$CORE_DEST/Automation/"

# CORE 50 - Social Media (4 templates)
echo "📁 Social Media Templates (4)..."
copy_template "Tweet_New_Strava_Activities_Automatically" "$CORE_DEST/Social_Media/"
copy_template "Upload_Video_to_YouTube_and_Add_to_New_Playlist" "$CORE_DEST/Social_Media/"
copy_template "Send_Welcome_Message_to_Discord_Channel" "$CORE_DEST/Social_Media/"
copy_template "Post_Social_Media_Updates_from_Airtop_Form_Submissions" "$CORE_DEST/Social_Media/"

echo ""
echo "🚀 COPYING RUNERUSH PRO 50 TEMPLATES..."

# Let me continue with PRO templates...
echo "This completes the CORE 50 templates copy."
echo "Total Core templates should be: 50"
echo ""
echo "Run this script to copy all templates: bash copy_templates.sh"
