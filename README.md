# Gong Expansion Opportunity Tracker - Setup Guide

## Overview
This tool automatically scans Gong call recordings to identify expansion opportunities discussed in calls where Solution Managers were not present, and flags them for SM review.

## Architecture
- **Frontend**: React application with modern UI
- **Backend**: Node.js/Express API service
- **Integration**: Gong API v2 for call data and transcripts
- **Scheduling**: Automated scanning every 2 hours during business hours

## Prerequisites
1. Gong API access with the following scopes:
   - `api:calls:read`
   - `api:calls:read:transcript`
2. Node.js 16+ and npm
3. Environment variables configured (see below)

## Quick Start

### 1. Backend Setup

```bash
# Clone/create backend directory
mkdir gong-expansion-tracker-api
cd gong-expansion-tracker-api

# Initialize npm project
npm init -y

# Install dependencies
npm install express axios cors node-cron dotenv
npm install --save-dev nodemon

# Create .env file (see configuration below)
touch .env

# Create the main service file
# Copy the API service code into server.js

# Start the development server
npm run dev
```

### 2. Frontend Setup

```bash
# Create React app (if not using the provided artifact)
npx create-react-app gong-expansion-tracker-ui
cd gong-expansion-tracker-ui

# Install additional dependencies
npm install lucide-react

# Replace src/App.js with the provided React component
# Start development server
npm start
```

## Configuration

### Environment Variables (.env)
```bash
# Gong API Configuration
GONG_ACCESS_KEY=your_gong_access_key_here
GONG_ACCESS_KEY_SECRET=your_gong_access_key_secret_here
GONG_COMPANY_ID=your_company_id_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: Notification integrations
SLACK_WEBHOOK_URL=your_slack_webhook_url
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=notifications@yourcompany.com
```

### Package.json Scripts (Backend)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Gong API Setup

### 1. Create API Credentials
1. Log into your Gong instance as an admin
2. Go to Settings → Company Settings → API
3. Create a new API key with these scopes:
   - `api:calls:read`
   - `api:calls:read:transcript`
4. Save the Access Key and Access Key Secret

### 2. Find Your Company ID
Your Company ID can be found in the Gong URL when logged in:
`https://us-[COMPANY-ID].api.gong.io/v2/`

## Customization

### Merchant-SM Mapping
Update the `MERCHANT_SM_MAPPING` object in the service to match your organization:

```javascript
const MERCHANT_SM_MAPPING = {
  'MERCHANT-ID-1': { sm: 'John Smith', email: 'john.smith@company.com' },
  'MERCHANT-ID-2': { sm: 'Jane Doe', email: 'jane.doe@company.com' },
  // Add more mappings...
};
```

### Expansion Keywords
Customize the keywords that trigger expansion opportunity detection:

```javascript
const EXPANSION_KEYWORDS = [
  'expansion', 'upgrade', 'additional features', 'more users',
  'enterprise plan', 'scale up', 'add-on', 'premium',
  // Add your industry-specific terms...
];
```

### Notification Integration

#### Slack Integration
```javascript
async function sendSlackNotification(opportunity) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  
  await axios.post(webhook, {
    text: `🚩 New expansion opportunity detected!`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${opportunity.merchant}* - Score: ${opportunity.opportunityScore}/10`
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*MSM:* ${opportunity.msm}` },
          { type: "mrkdwn", text: `*Assigned SM:* ${opportunity.assignedSM}` },
          { type: "mrkdwn", text: `*Call Date:* ${opportunity.callDate}` },
          { type: "mrkdwn", text: `*Keywords:* ${opportunity.detectedKeywords.join(', ')}` }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View Recording" },
            url: opportunity.callRecordingUrl
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Acknowledge" },
            value: opportunity.id,
            action_id: "acknowledge_opportunity"
          }
        ]
      }
    ]
  });
}
```

#### Email Integration (SendGrid)
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailNotification(opportunity) {
  const msg = {
    to: opportunity.smEmail,
    from: process.env.FROM_EMAIL,
    subject: `New Expansion Opportunity: ${opportunity.merchant}`,
    html: `
      <h2>New Expansion Opportunity Detected</h2>
      <p><strong>Merchant:</strong> ${opportunity.merchant}</p>
      <p><strong>Opportunity Score:</strong> ${opportunity.opportunityScore}/10</p>
      <p><strong>MSM:</strong> ${opportunity.msm}</p>
      <p><strong>Call Date:</strong> ${opportunity.callDate}</p>
      <p><strong>Detected Keywords:</strong> ${opportunity.detectedKeywords.join(', ')}</p>
      <p><strong>Excerpt:</strong> "${opportunity.transcript}"</p>
      <p><a href="${opportunity.callRecordingUrl}">Listen to Recording</a></p>
    `
  };
  
  await sgMail.send(msg);
}
```

## Deployment

### Production Environment
1. Set up a cloud server (AWS, GCP, Azure)
2. Configure environment variables
3. Set up a reverse proxy (nginx)
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name "gong-expansion-tracker"
pm2 startup
pm2 save
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Monitoring & Maintenance

### Health Checks
The API includes a health endpoint at `/api/health` that returns:
- Service status
- Number of processed calls
- Number of flagged opportunities
- Timestamp

### Logs
Monitor the application logs for:
- Successful API authentications
- New opportunities flagged
- Failed API calls
- Scheduled scan results

### Database Migration
For production use, replace the in-memory storage with a proper database:

```javascript
// Example with PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create opportunities table
async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id VARCHAR PRIMARY KEY,
      call_id VARCHAR NOT NULL,
      merchant VARCHAR NOT NULL,
      merchant_id VARCHAR NOT NULL,
      opportunity_score DECIMAL,
      status VARCHAR DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      acknowledged_at TIMESTAMP,
      data JSONB
    );
  `);
}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials in .env file
   - Check if API key has required scopes
   - Ensure company ID is correct

2. **No Opportunities Detected**
   - Review expansion keywords
   - Check merchant-SM mapping
   - Verify calls have transcripts available

3. **Missing Transcripts**
   - Ensure calls are completed (not ongoing)
   - Verify transcript permissions in Gong
   - Check if recording was successful

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG=true
```

## Security Considerations

1. **API Key Security**
   - Store credentials in environment variables
   - Use secrets management in production
   - Rotate keys regularly

2. **Data Privacy**
   - Ensure compliance with data retention policies
   - Implement proper access controls
   - Consider data encryption at rest

3. **Network Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Set up proper CORS policies

## Support

For questions or issues:
1. Check the application logs
2. Review Gong API documentation
3. Test API connectivity with health endpoint
4. Monitor scheduled job execution

## License
This tool is provided as-is for internal use. Ensure compliance with Gong's API terms of service.