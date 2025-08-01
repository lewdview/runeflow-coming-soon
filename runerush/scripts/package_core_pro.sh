#!/bin/bash

# Define source and destination directories
SOURCE_DIR="/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_runeflow_organized"
CORE_DIR="templates/core"
PRO_DIR="templates/pro"

# Create destination directories
mkdir -p "$CORE_DIR"
mkdir -p "$PRO_DIR"

# Core Bundle Templates (50 templates)
CORE_TEMPLATES=(
  "AI_Research/Translate_Web_Content_Using_DeepL_API.json"
  "AI_Research/Generate_Images_via_API_Using_OpenAI.json"
  "AI_Research/Image_Generation_via_Webhook_Trigger_and_AI_Response.json"
  "AI_Research/Parse_and_Structure_AI-Generated_Text_Responses.json"
  "AI_Research/AI-Powered_Document_Q&A_Using_LangChain_and_OpenAI.json"
  "Email_Marketing/Receive_updates_when_a_form_is_submitted_in_Wufoo.json"
  "Email_Marketing/ConvertKit_Form_Subscriber_Notification.json"
  "Email_Marketing/Chargebee_Event_Notifications.json"
  "Email_Marketing/Receive_updates_when_a_new_list_is_created_in_Affinity.json"
  "Email_Marketing/Receive_updates_for_events_in_ClickUp.json"
  "Ecommerce/3280_workflow_3280.json"
  "Ecommerce/Sync_and_Analyze_Postgres_Data_with_AI_Assistance.json"
  "Ecommerce/process_code_wait_7nodes.json"
  "Ecommerce/Fetch_Cocktail_Data_and_Save_as_Local_JSON_File.json"
  "Ecommerce/Web_Request_Handler_with_Email_Notifications.json"
  "Ecommerce/1744_workflow_1744.json"
  "Ecommerce/3218_workflow_3218.json"
  "Automation/Scheduled_URL_Health_Check_and_Ping_Monitor.json"
  "Automation/Manually_Add_New_Task_to_Google_Tasks_List.json"
  "Automation/Create_a_new_task_in_Todoist.json"
  "Automation/Create_an_Onfleet_task_when_a_file_in_Google_Drive_is_updated.json"
  "Automation/automation_manual_googlecalendar.json"
  "Social_Media/Twitter_Post_Conditional_Action_Trigger.json"
  "Social_Media/Manually_Triggered_RSS_Feed_Reader.json"
  "Social_Media/Tweet_New_Strava_Activities_Automatically.json"
  "Social_Media/scheduled_automation_httprequest_twitter.json"
  "Social_Media/automation_manual_twitter.json"
  "Social_Media/automation_rssfeedread_manual.json"
  "Development_Tools/AI-Powered_Chatbot_with_Webhook_Response_Handler.json"
  "Development_Tools/webhook_process_httprequest_complex_14nodes.json"
  "Development_Tools/process_airtop_manual.json"
  "Development_Tools/2620_workflow_2620.json"
  "Development_Tools/3251_workflow_3251.json"
  "Development_Tools/automation_manual_mailjet.json"
  "Integration_Hub/Initialize_Standup_Bot_with_Binary_File_Setup.json"
  "Integration_Hub/Track_New_Toggl_Time_Entries_Automatically.json"
  "Integration_Hub/webhook_automation_notion.json"
  "Integration_Hub/webhook_automation_keap.json"
  "Integration_Hub/webhook_automation_respondtowebhook_7nodes.json"
  "Integration_Hub/webhook_automation_copper.json"
  "Task_Management/Webhook_Triggers_HTTP_Request_and_Response.json"
  "Task_Management/Format_and_Validate_US_Phone_Numbers.json"
  "Task_Management/webhook_automation_jotform.json"
  "Task_Management/webhook_automation_demio_typeform.json"
  "Task_Management/automation_httprequest_deepl.json"
  "Task_Management/FTP_File_Upload_and_HTTP_Request_Automation.json"
  "Business_Intelligence/Automatically_Adjust_Plex_Server_Performance.json"
  "Business_Intelligence/CV_Evaluation_-_Error_Handling_complex_13nodes.json"
  "Business_Intelligence/Create_a_company_in_Salesmate.json"
  "Finance_Accounting/Gmail_to_Sheets_AI-Powered_Email_Analysis_and_Reporting.json"
)

# Pro Bundle Templates (50 templates)
PRO_TEMPLATES=(
  "AI_Research/7604ck94MeYXMHpN_Read_RSS_feed_from_two_different_sources.json"
  "AI_Research/communicate_emailreadimap.json"
  "AI_Research/102_Send_updates_about_the_position_of_the_ISS_every_minute_to_a_topic_in_ActiveMQ.json"
  "AI_Research/GetResponse_to_Airtable_Data_Transfer.json"
  "AI_Research/Analyze_URL_and_Extract_Job_Details_with_Cortex.json"
  "Email_Marketing/Receive_updates_for_specified_tasks_in_Flow.json"
  "Email_Marketing/Receive_updates_when_a_new_activity_gets_created_and_tweet_about_it.json"
  "Email_Marketing/Discord_Intro.json"
  "Ecommerce/3545_workflow_3545.json"
  "AI_Research/Compare_and_Analyze_Two_MySQL_Database_Datasets.json"
  "AI_Research/Verify_Email_Addresses_Using_Hunter.json"
  "AI_Research/Email_Bounce_and_Open_Notifications_via_Postmark.json"
  "AI_Research/MailChimp_Activity_Notification.json"
  "AI_Research/webhook_process_airtable_autopilot.json"
  "AI_Research/New_ActiveCampaign_Account_Alert_for_Admins.json"
  "AI_Research/Daily_Cocktail_Recipe_Image_Shared_to_Rocket.Chat.json"
  "Automation/Retrieve_Top_Hacker_News_Stories_on_Demand.json"
  "Automation/Manually_Add_Events_to_Google_Calendar.json"
  "Automation/automation_hackernews_manual.json"
  "Social_Media/Create_New_User_Profile_in_Vero_Marketing_Platform.json"
  "Social_Media/automation_storyblok_manual.json"
  "Development_Tools/8n0VYmvJgISwezyz_Build_your_first_AI_MCP_Server.json"
  "AI_Research/Find_Person_s_Details_Using_Email_via_Clearbit.json"
  "AI_Research/Retrieve_and_Answer_Questions_Using_LangChain_AI.json"
  "AI_Research/Post_Social_Media_Updates_from_Airtop_Form_Submissions.json"
  "AI_Research/Track_New_MailerLite_Subscribers_in_Airtable.json"
  "AI_Research/Daily_Cocktail_Recipe_via_Telegram_Bot.json"
  "AI_Research/webhook_process_airtable_getresponse.json"
  "AI_Research/Discord_Bot_Responds_to_YouTube_Queries_with_AI.json"
  "Development_Tools/automation_manual_n8n.json"
  "Integration_Hub/webhook_automation_respondtowebhook_7nodes_1.json"
  "Integration_Hub/automation_openthesaurus_manual.json"
  "Integration_Hub/webhook_automation_respondtowebhook_7nodes.json"
  "Task_Management/webhook_automation_httprequest_1.json"
  "Task_Management/automation_httprequest_manual_8.json"
  "Task_Management/automation_httprequest_manual_9.json"
  "AI_Research/Receive_updates_when_an_email_is_bounced_or_opened.json"
  "AI_Research/YouTube_to_Raindrop_6nodes.json"
  "AI_Research/webhook_automation_mailchimp.json"
  "AI_Research/webhook_process_airtable_wise.json"
  "AI_Research/Add_a_subscriber_to_a_list_and_create_and_send_a_campaign.json"
  "AI_Research/Analyze_a_URL_and_get_the_job_details_using_the_Cortex_node.json"
  "Task_Management/automation_httprequest_manual_1.json"
  "Business_Intelligence/Create_New_Organization_in_Affinity_CRM.json"
  "Business_Intelligence/Auto-Review_GitLab_Merge_Requests_with_Risk_Assessment.json"
  "Business_Intelligence/Schedule_and_Create_Automated_Threads_on_Bluesky.json"
  "Business_Intelligence/Manually_Trigger_Rundeck_Job_Execution.json"
  "Business_Intelligence/GitLab_MR_Auto-Review_&_Risk_Assessment_complex_23nodes.json"
  "Finance_Accounting/RAG_Workflow_For_Stock_Earnings_Report_Analysis_complex_18nodes.json"
  "Finance_Accounting/Scheduled_MySQL_Data_Export_to_Outlook_Email.json"
)

# Copy templates for Core Bundle
for template in "${CORE_TEMPLATES[@]}"; do
  cp "${SOURCE_DIR}/${template}" "${CORE_DIR}"
done

# Copy templates for Pro Bundle
for template in "${PRO_TEMPLATES[@]}"; do
  cp "${SOURCE_DIR}/${template}" "${PRO_DIR}"
done

# Create zip archives
cd "$CORE_DIR"
zip -r "../runerush-core-50-templates.zip" *
cd - 

cd "$PRO_DIR"
zip -r "../runerush-pro-advanced-50-templates.zip" *
cd - 

# Clean up the directories
rm -rf "$CORE_DIR"/*
rm -rf "$PRO_DIR"/*

echo "Created runerush-core-50-templates.zip and runerush-pro-advanced-50-templates.zip with selected templates"

