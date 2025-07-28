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

echo "🔥 COPYING RUNERUSH PRO 50 TEMPLATES..."

# PRO 50 - AI Research (12 templates)
echo "📁 AI Research Templates (12)..."
copy_template "Slack_AI_Chatbot_with_RAG_for_company_staff" "$PRO_DEST/AI_Research/"
copy_template "AI-Powered_Database_Query_and_Chart_Generation_Assistant" "$PRO_DEST/AI_Research/"
copy_template "AI-Powered_Social_Media_Amplifier" "$PRO_DEST/AI_Research/"
copy_template "AI-Powered_RAG_Workflow_For_Stock_Earnings_Report_Analysis" "$PRO_DEST/AI_Research/"
copy_template "AI_Agent_for_Instagram_DM_inbox_with_Manychat_+_OpenAI" "$PRO_DEST/AI_Research/"
copy_template "AI_Automated_HR_Workflow_for_CV_Analysis" "$PRO_DEST/AI_Research/"
copy_template "AI_Agent_for_realtime_insights_on_meetings" "$PRO_DEST/AI_Research/"
copy_template "AI_agent_that_can_scrape_webpages" "$PRO_DEST/AI_Research/"
copy_template "AI_Fitness_Coach_Strava_Data_Analysis" "$PRO_DEST/AI_Research/"
copy_template "AI_Youtube_Trend_Finder_Based_On_Niche" "$PRO_DEST/AI_Research/"
copy_template "AI_Data_Extraction_with_Dynamic_Prompts_and_Airtable" "$PRO_DEST/AI_Research/"
copy_template "AI_Crew_to_Automate_Fundamental_Stock_Analysis" "$PRO_DEST/AI_Research/"

# PRO 50 - Automation (14 templates)
echo "📁 Automation Templates (14)..."
copy_template "Manually_Add_New_Task_to_Google_Tasks_List" "$PRO_DEST/Automation/"
copy_template "Retrieve_Top_Hacker_News_Stories_on_Demand" "$PRO_DEST/Automation/"
copy_template "Execute_Commands_on_Schedule_or_Manual_Trigger" "$PRO_DEST/Automation/"
copy_template "Manually_Create_New_Asana_Task" "$PRO_DEST/Automation/"
copy_template "Manually_Add_New_Task_to_Todoist" "$PRO_DEST/Automation/"
copy_template "Retrieve_All_Tasks_from_Flow_with_Manual_Trigger" "$PRO_DEST/Automation/"
copy_template "Monitor_Incoming_Emails_via_IMAP" "$PRO_DEST/Automation/"
copy_template "Convert_Spreadsheet_to_Email_Attachment" "$PRO_DEST/Automation/"
copy_template "Automated_Backup_of_n8n_Data_to_Nextcloud_Storage" "$PRO_DEST/Automation/"
copy_template "Compare_and_Analyze_Two_MySQL_Database_Datasets" "$PRO_DEST/Automation/"
copy_template "Verify_Email_Addresses_Using_Hunter" "$PRO_DEST/Automation/"
copy_template "Find_Person_s_Details_Using_Email_via_Clearbit" "$PRO_DEST/Automation/"
copy_template "Track_New_MailerLite_Subscribers_in_Airtable" "$PRO_DEST/Automation/"
copy_template "Send_the_Astronomy_Picture_of_the_day_to_Telegram" "$PRO_DEST/Automation/"

# PRO 50 - Email Marketing (13 templates)
echo "📁 Email Marketing Templates (13)..."
copy_template "Send_Welcome_Message_to_Discord_Channel" "$PRO_DEST/Email_Marketing/"
copy_template "Receive_updates_when_a_form_is_submitted_in_Wufoo" "$PRO_DEST/Email_Marketing/"
copy_template "Clockify_Time_Entry_Notifications" "$PRO_DEST/Email_Marketing/"
copy_template "Affinity_List_Creation_Notifications" "$PRO_DEST/Email_Marketing/"
copy_template "TheHive_Event_Notification_System" "$PRO_DEST/Email_Marketing/"
copy_template "Copper_CRM_Event_Notification_Trigger" "$PRO_DEST/Email_Marketing/"
copy_template "Keap_Event_Notification_System" "$PRO_DEST/Email_Marketing/"
copy_template "Gumroad_Sales_Notification_Alert" "$PRO_DEST/Email_Marketing/"
copy_template "Daily_Cocktail_Recipe_via_Telegram_Bot" "$PRO_DEST/Email_Marketing/"
copy_template "Calendly_Event_Notification" "$PRO_DEST/Email_Marketing/"
copy_template "Monitor_ActiveMQ_Queue_for_New_Messages" "$PRO_DEST/Email_Marketing/"
copy_template "Schedule_Discord_Messages_Using_Cron_Timing" "$PRO_DEST/Email_Marketing/"
copy_template "Track_ISS_Location_and_Send_Updates_to_Kafka" "$PRO_DEST/Email_Marketing/"

# PRO 50 - Social Media (7 templates)
echo "📁 Social Media Templates (7)..."
copy_template "Download_and_Add_Text_to_Internet_Image" "$PRO_DEST/Social_Media/"
copy_template "Create_New_User_Profile_in_Vero_Marketing_Platform" "$PRO_DEST/Social_Media/"
copy_template "Publish_Storyblok_Stories_with__Release__Prefix" "$PRO_DEST/Social_Media/"
copy_template "Manually_Trigger_WordPress_Post_Creation" "$PRO_DEST/Social_Media/"
copy_template "Twitter_Post_Conditional_Action_Trigger" "$PRO_DEST/Social_Media/"
copy_template "Manually_Triggered_RSS_Feed_Reader" "$PRO_DEST/Social_Media/"
copy_template "Edit_Image_and_Send_via_HTTP_Request" "$PRO_DEST/Social_Media/"

# PRO 50 - E-commerce (4 templates)
echo "📁 E-commerce Templates (4)..."
copy_template "Store_Phantombuster_Output_in_Airtable" "$PRO_DEST/Ecommerce/"
copy_template "Keyword_Research:_Fetch_Search_Volumes_for_New_Terms" "$PRO_DEST/Ecommerce/"
copy_template "Fetch_Company_Branding_and_Store_in_Airtable" "$PRO_DEST/Ecommerce/"
copy_template "OpenSea_NFT_Market_Analysis_with_AI_Agent" "$PRO_DEST/Ecommerce/"

echo "🚀 Finished copying RUNERUSH PRO 50 TEMPLATES."

