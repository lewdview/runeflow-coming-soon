# Web Scraping Templates

## Description
Templates designed for automated data extraction from websites, web crawling, and content gathering from various online sources.

### Inputs/Parameters
- **Target URLs**: List of websites or specific pages to scrape
- **Scraping Rules**: CSS selectors, XPath expressions, or element identifiers
- **Data Fields**: Specific data points to extract (title, price, description, etc.)
- **Request Headers**: User agent, authentication tokens, or other HTTP headers
- **Rate Limiting**: Delay between requests to avoid being blocked
- **Output Format**: JSON, CSV, database, or other storage format

### Processing Logic/AI Prompt Skeleton
```
Web Scraping Configuration:
Target: {target_url}
Data Points: {data_fields}
Extraction Rules: {scraping_rules}

Process:
1. Navigate to target URL with proper headers
2. Wait for page load and dynamic content
3. Extract specified data using selectors:
   - {field_1}: {selector_1}
   - {field_2}: {selector_2}
   - {field_3}: {selector_3}
4. Clean and validate extracted data
5. Handle pagination if present
6. Store results in {output_format}
7. Implement error handling for:
   - Connection timeouts
   - Rate limiting (429 errors)
   - Missing elements
   - Changed page structure
```

### Expected Outputs
- **Extracted Data**: Structured data in requested format (JSON, CSV, database)
- **Scraping Report**: Success/failure rates, errors encountered, pages processed
- **Data Quality Metrics**: Completeness, accuracy, and validation results
- **Monitoring Alerts**: Notifications for scraping failures or data anomalies

### Example
**Input**: E-commerce product monitoring
```json
{
  "target_urls": ["https://example-store.com/products"],
  "data_fields": ["title", "price", "availability", "rating"],
  "scraping_rules": {
    "title": ".product-title h1",
    "price": ".price-current",
    "availability": ".stock-status",
    "rating": ".rating-stars"
  }
}
```

**Output**:
```json
{
  "scraped_data": [
    {
      "title": "Premium Laptop Stand",
      "price": "$49.99",
      "availability": "In Stock",
      "rating": "4.5/5 stars",
      "scraped_at": "2024-01-15T10:30:00Z"
    }
  ],
  "scraping_stats": {
    "pages_processed": 150,
    "success_rate": "98%",
    "errors": 3
  }
}
```

### Category Tags & SEO Keywords
`Web Scraping`, `Data Extraction`, `Web Crawling`, `Content Harvesting`, `Automated Data Collection`, `Price Monitoring`, `Lead Generation`, `Market Research`, `Competitive Intelligence`, `HTML Parsing`, `API Alternatives`, `Data Mining`

## Specialized Sub-Templates

### E-commerce Scraping
- **Price Monitoring**: Track product prices across multiple retailers
- **Inventory Tracking**: Monitor stock levels and availability
- **Review Analysis**: Extract and analyze customer reviews

### Content Aggregation
- **News Scraping**: Collect articles from news websites
- **Social Media Monitoring**: Track mentions and engagement
- **Blog Content Extraction**: Gather content from multiple blogs

### Lead Generation
- **Directory Scraping**: Extract business contact information
- **Social Profile Collection**: Gather professional profiles
- **Event Attendee Lists**: Extract participant information

### Market Research
- **Competitor Analysis**: Monitor competitor websites and pricing
- **Industry Reports**: Collect market data and statistics
- **Trend Monitoring**: Track emerging topics and keywords

## Technical Requirements
- **Web Scraping Libraries**: BeautifulSoup, Scrapy, Selenium, Playwright
- **Proxy Services**: Rotating proxies to avoid IP blocking
- **Database Storage**: PostgreSQL, MongoDB, or cloud storage
- **Monitoring Tools**: Uptime monitoring, error alerting
- **Rate Limiting**: Respectful scraping practices
- **Legal Compliance**: robots.txt compliance, terms of service adherence

## Best Practices
- Respect website terms of service and robots.txt
- Implement proper rate limiting and delays
- Use rotating user agents and proxies
- Handle dynamic content with JavaScript rendering
- Implement robust error handling and retry logic
- Monitor for website structure changes
- Store scraped data efficiently with proper indexing
