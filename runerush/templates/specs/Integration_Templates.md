# Integration Templates

## Description
Templates for connecting and synchronizing data between different systems, APIs, CRMs, databases, and third-party platforms to create seamless multi-platform workflows.

### Inputs/Parameters
- **Source System**: Origin platform/service (CRM, database, API endpoint)
- **Target System**: Destination platform/service for data synchronization
- **Authentication**: API keys, OAuth tokens, database credentials
- **Data Mapping**: Field mappings between source and target systems
- **Sync Rules**: Frequency, conditions, and filters for data synchronization
- **Transformation Logic**: Data cleaning, formatting, and validation rules
- **Error Handling**: Retry policies, fallback procedures, logging settings

### Processing Logic/AI Prompt Skeleton
```
Integration Configuration:
Source: {source_system}
Target: {target_system}
Sync Type: {sync_type} (real-time/batch/scheduled)

Data Flow Process:
1. Authentication and Connection:
   - Verify credentials for {source_system}
   - Establish connection to {target_system}
   - Test connectivity and permissions

2. Data Retrieval:
   - Query {source_system} using filters: {query_filters}
   - Extract data fields: {source_fields}
   - Apply business rules and validations

3. Data Transformation:
   - Map source fields to target schema:
     {source_field_1} → {target_field_1}
     {source_field_2} → {target_field_2}
   - Apply data transformations: {transformation_rules}
   - Validate data quality and completeness

4. Data Loading:
   - Insert/update records in {target_system}
   - Handle duplicates using: {deduplication_strategy}
   - Log successful transfers and errors

5. Error Handling:
   - Retry failed transfers: {retry_count} times
   - Send alerts for critical failures
   - Maintain sync status and audit logs

Monitoring: Track sync performance, data accuracy, system health
```

### Expected Outputs
- **Synchronized Data**: Successfully transferred and mapped data between systems
- **Sync Reports**: Success/failure rates, data quality metrics, performance stats
- **Error Logs**: Detailed failure information with resolution suggestions
- **Data Validation**: Consistency checks and data integrity reports
- **Real-time Dashboards**: Live monitoring of integration health and status

### Example
**Input**: Salesforce to HubSpot lead synchronization
```json
{
  "source": "Salesforce CRM",
  "target": "HubSpot CRM",
  "sync_frequency": "real-time",
  "data_mapping": {
    "FirstName": "firstname",
    "LastName": "lastname",
    "Email": "email",
    "Company": "company",
    "Status": "lifecyclestage"
  },
  "sync_conditions": "LastModifiedDate > YESTERDAY"
}
```

**Output**:
```json
{
  "sync_summary": {
    "records_processed": 247,
    "successful_transfers": 245,
    "failed_transfers": 2,
    "duplicates_skipped": 12,
    "sync_duration": "3.2 seconds"
  },
  "data_quality": {
    "completeness_score": 0.98,
    "validation_errors": 2,
    "missing_required_fields": ["email field empty for 2 records"]
  },
  "next_sync": "2024-01-15T15:30:00Z"
}
```

### Category Tags & SEO Keywords
`API Integration`, `Data Synchronization`, `CRM Integration`, `Database Sync`, `Multi-Platform`, `Workflow Automation`, `Data Migration`, `System Integration`, `ETL`, `Real-time Sync`, `Salesforce`, `HubSpot`, `Zapier Alternative`, `iPaaS`

## Specialized Sub-Templates

### CRM Integrations
- **Salesforce Sync**: Bidirectional data sync with Salesforce CRM
- **HubSpot Integration**: Contact and deal synchronization
- **Pipedrive Connector**: Pipeline and activity data integration
- **Zoho CRM Bridge**: Lead and customer data management

### E-commerce Integrations
- **Shopify Integration**: Product, order, and customer data sync
- **WooCommerce Connector**: WordPress e-commerce integration
- **Magento Bridge**: Catalog and order management sync
- **Amazon Integration**: Marketplace order and inventory sync

### Marketing Platform Integrations
- **Mailchimp Sync**: Email list and campaign data integration
- **ConvertKit Bridge**: Subscriber and tag synchronization
- **ActiveCampaign Connector**: Contact and automation data sync
- **SendGrid Integration**: Email delivery and analytics sync

### Database Integrations
- **MySQL Connector**: Relational database synchronization
- **PostgreSQL Integration**: Advanced database operations
- **MongoDB Bridge**: NoSQL document database sync
- **Google Sheets Integration**: Spreadsheet data management

### Accounting System Integrations
- **QuickBooks Sync**: Financial data and transaction sync
- **Xero Integration**: Accounting data synchronization
- **FreshBooks Connector**: Invoice and payment data sync
- **Stripe Integration**: Payment processing data sync

## Technical Requirements
- **API Management**: Rate limiting, authentication, error handling
- **Data Transformation**: ETL tools, data mapping engines
- **Queue Systems**: Message queues for reliable data processing
- **Monitoring**: Real-time alerts, performance metrics, health checks
- **Security**: Encrypted connections, secure credential storage
- **Scalability**: Handle high-volume data transfers efficiently

## Integration Patterns

### Real-time Synchronization
```
1. Webhook received from source system
2. Data validated and transformed
3. Immediate push to target system
4. Confirmation and logging
5. Error handling if target unavailable
```

### Batch Processing
```
1. Scheduled job initiates sync
2. Bulk data extraction from source
3. Data transformation and validation
4. Batch upload to target system
5. Reconciliation and error reporting
```

### Event-Driven Integration
```
1. Event triggers in source system
2. Event data captured and queued
3. Processing rules applied
4. Multiple target systems updated
5. Audit trail maintained
```

## Best Practices
- Implement proper error handling and retry mechanisms
- Use rate limiting to respect API quotas
- Maintain comprehensive audit logs
- Implement data validation at multiple stages
- Use secure authentication methods (OAuth2, API keys)
- Monitor integration performance and health
- Implement data backup and recovery procedures
- Test integrations thoroughly before production deployment
- Document all data mappings and transformation rules
- Plan for API version changes and system updates
