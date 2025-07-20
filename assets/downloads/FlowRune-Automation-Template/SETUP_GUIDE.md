# ⚡ FlowRune: Viral ASMR Creator - Complete Setup Guide

## 🔮 Welcome to the FlowRune

**Rune:** ᛚᚱ (Laguz-Raidho) - The FlowRune  
**Ancient Meaning:** Flow + Journey = Viral Content Creation  
**Modern Power:** AI-Powered ASMR Video Automation  
**Value:** $97 (Included in RuneFlow Starter Pack)

---

## 🎯 What This Template Does

The FlowRune creates viral ASMR videos featuring glass objects being cut, then automatically posts them across multiple social media platforms. It's designed to generate consistent, high-engagement content that has viral potential.

### ✨ Key Features

- **🤖 AI-Powered Content Creation**: Generates unique glass object ideas and hyper-realistic video prompts
- **🎥 Professional Video Generation**: Creates 9:16 mobile-optimized videos with 4-layer ASMR audio
- **📱 Multi-Platform Automation**: Posts to YouTube, Instagram, and TikTok simultaneously
- **🔄 Scheduled Execution**: Runs every 8 hours automatically
- **📊 Content Tracking**: Prevents duplicate objects and tracks performance
- **🎨 Glass-Cutting Aesthetic**: Focuses on satisfying visual and audio elements

### 🎬 Video Specifications

- **Aspect Ratio:** 9:16 (TikTok/Instagram Reels optimized)
- **Quality:** Photorealistic, cinematic
- **Audio:** 4-layer ASMR sound design
- **Style:** Glass objects on dark wooden cutting board
- **Duration:** Optimized for social media engagement

---

## 🚀 Quick Start Guide

### Prerequisites

Before setting up the FlowRune, ensure you have:

1. **n8n Instance** (Cloud or self-hosted)
2. **OpenRouter API Key** (for AI agents)
3. **Fal AI API Key** (for video generation)
4. **Blotato Account** (for social media posting)
5. **Google Sheets Access** (for content tracking)
6. **Social Media Account IDs** (YouTube, Instagram, TikTok)

### Step 1: Import the FlowRune Template

1. Open your n8n instance
2. Click "Import from file"
3. Select `flowrune-asmr.json`
4. Click "Import"

### Step 2: Configure API Credentials

#### OpenRouter (AI Agents)
1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Create an account and get your API key
3. In n8n, go to Settings → Credentials → Add New
4. Select "OpenRouter API"
5. Enter your API key

#### Fal AI (Video Generation)
1. Visit [Fal.ai](https://fal.ai/)
2. Sign up and obtain your API key
3. In n8n, create HTTP Header Auth credential
4. Set header name as "Authorization"
5. Set header value as "Key YOUR_FAL_API_KEY"

#### Blotato (Social Media Posting)
1. Sign up at [Blotato.com](https://blotato.com/)
2. Get your API key from the dashboard
3. Connect your social media accounts
4. Note down your account IDs for YouTube, Instagram, and TikTok

### Step 3: Set Up Google Sheets Tracking

1. Create a new Google Sheet with columns:
   - `Object` (for glass object names)
   - `URL` (for video URLs)
2. Share the sheet with your Google service account
3. Copy the sheet ID from the URL
4. Update the Google Sheets nodes with your sheet ID

### Step 4: Configure Account IDs

Replace the placeholder account IDs in the social media posting nodes:

- **YouTube Node:** Replace `YOUR_YOUTUBE_ACCOUNT_ID`
- **Instagram Node:** Replace `YOUR_INSTAGRAM_ACCOUNT_ID`
- **TikTok Node:** Replace `YOUR_TIKTOK_ACCOUNT_ID`

### Step 5: Test the Workflow

1. Activate the FlowRune workflow
2. Click "Execute Workflow" to test
3. Monitor the execution to ensure all nodes complete successfully
4. Check your social media accounts for posted content

---

## 🔧 Detailed Configuration

### AI Agent Configuration

The FlowRune uses two AI agents:

#### 1. Idea Agent
- **Purpose:** Generates unique glass object ideas
- **Model:** GPT-4 via OpenRouter
- **Input:** List of previously used objects
- **Output:** New glass object concept + caption

#### 2. Prompt Agent
- **Purpose:** Creates detailed video prompts
- **Model:** GPT-4 via OpenRouter
- **Input:** Glass object name
- **Output:** Hyper-realistic ASMR video prompt

### Video Generation Settings

The Fal AI video generation uses these parameters:
- **Prompt:** AI-generated detailed description
- **Aspect Ratio:** 9:16 (mobile-optimized)
- **Audio:** Enabled for ASMR experience
- **Quality:** Photorealistic

### Social Media Posting

Each platform has specific optimizations:

#### YouTube
- **Format:** Long-form potential
- **Privacy:** Public
- **Notifications:** Disabled initially
- **Title:** Generated caption

#### Instagram
- **Format:** Reels
- **Caption:** AI-generated
- **Hashtags:** Optimized for discovery

#### TikTok
- **Format:** Short-form video
- **Privacy:** Public to everyone
- **AI Generated:** Marked as true
- **Features:** Comments, duets, stitches enabled

---

## 📊 Expected Results

### Performance Metrics

With proper setup, you should see:
- **Video Quality:** Photorealistic, engaging content
- **Posting Frequency:** New content every 8 hours
- **Platform Coverage:** YouTube, Instagram, TikTok
- **Engagement:** High ASMR community engagement
- **Virality Potential:** Optimized for shares and saves

### Content Characteristics

- **Visual Appeal:** Satisfying glass-cutting scenes
- **Audio Quality:** 4-layer ASMR sound design
- **Uniqueness:** No duplicate objects
- **Consistency:** Regular posting schedule
- **Mobile Optimization:** 9:16 aspect ratio

---

## 🎨 Customization Options

### Modifying Object Types

You can customize the types of objects by editing the Idea Agent prompt:
- Change from fruits to other categories
- Adjust aesthetic preferences
- Modify complexity requirements

### Video Style Adjustments

Customize the video generation by modifying the Prompt Agent:
- Change cutting board material
- Adjust lighting preferences
- Modify camera angles
- Alter sound design emphasis

### Posting Schedule

Modify the schedule trigger to change posting frequency:
- Current: Every 8 hours
- Options: Every 4 hours, 12 hours, daily
- Consider platform best practices

### Caption Optimization

Enhance social media captions by:
- Adding trending hashtags
- Including call-to-actions
- Customizing for each platform
- Adding brand mentions

---

## 🛠️ Troubleshooting Guide

### Common Issues

#### Video Generation Fails
- **Check:** Fal AI API key and credits
- **Solution:** Verify API key and ensure sufficient credits
- **Prevention:** Monitor usage and set up alerts

#### Social Media Posting Errors
- **Check:** Blotato API key and account connections
- **Solution:** Reconnect social media accounts
- **Prevention:** Regular credential validation

#### Duplicate Objects
- **Check:** Google Sheets connection and data
- **Solution:** Verify sheet access and column structure
- **Prevention:** Regular data cleanup

#### AI Agent Errors
- **Check:** OpenRouter API key and model access
- **Solution:** Verify API key and model permissions
- **Prevention:** Monitor API usage and limits

### Performance Optimization

#### Speed Improvements
- Optimize wait times between requests
- Use parallel processing where possible
- Cache frequently used data

#### Quality Enhancements
- Refine AI prompts for better results
- Adjust video generation parameters
- Optimize social media posting times

---

## 📈 Success Metrics

### Key Performance Indicators

Track these metrics to measure FlowRune success:

#### Content Metrics
- **Videos Created:** Target 3 per day
- **Uniqueness Rate:** 100% (no duplicates)
- **Generation Success:** >95%
- **Posting Success:** >90%

#### Engagement Metrics
- **View Counts:** Platform-specific targets
- **Engagement Rate:** Comments, likes, shares
- **Viral Potential:** Shares and saves
- **Follower Growth:** Monthly increases

#### Technical Metrics
- **Execution Success:** >98%
- **API Response Time:** <30 seconds
- **Error Rate:** <2%
- **Uptime:** 24/7 operation

---

## 🎯 Best Practices

### Content Strategy

1. **Consistency:** Maintain regular posting schedule
2. **Quality:** Ensure high-quality video generation
3. **Uniqueness:** Track and avoid duplicate content
4. **Engagement:** Monitor and respond to comments
5. **Trends:** Adapt to platform algorithm changes

### Technical Maintenance

1. **Monitoring:** Set up alerts for failures
2. **Backup:** Regular workflow backups
3. **Updates:** Keep API credentials current
4. **Testing:** Regular execution testing
5. **Optimization:** Continuous improvement

### Platform-Specific Tips

#### YouTube
- Optimize titles for search
- Use relevant tags
- Create playlists for organization
- Engage with comments quickly

#### Instagram
- Use trending hashtags
- Post during peak hours
- Engage with ASMR community
- Create story highlights

#### TikTok
- Follow trending sounds
- Use viral hashtags
- Engage with trends
- Post consistently

---

## 🆘 Support & Resources

### Getting Help

#### RuneFlow Support
- **Email:** support@runeflow.co
- **Discord:** discord.gg/runeflow
- **Website:** https://runeflow.co
- **Documentation:** https://docs.runeflow.co

#### Community Resources
- **ASMR Communities:** Reddit, Discord
- **n8n Documentation:** https://docs.n8n.io
- **Video Creation Tips:** YouTube tutorials
- **Social Media Best Practices:** Platform help centers

### Additional Resources

#### API Documentation
- [OpenRouter API](https://openrouter.ai/docs)
- [Fal AI Documentation](https://fal.ai/docs)
- [Blotato API Reference](https://blotato.com/docs)
- [Google Sheets API](https://developers.google.com/sheets)

#### Learning Materials
- n8n Automation Courses
- ASMR Content Creation Guides
- Social Media Marketing Resources
- AI Prompt Engineering Tutorials

---

## 🚀 What's Next?

### Expansion Ideas

1. **Additional Platforms:** Pinterest, Reddit, YouTube Shorts
2. **Content Variations:** Different cutting styles, materials
3. **Seasonal Themes:** Holiday objects, seasonal fruits
4. **Interactive Elements:** Polls, questions, challenges
5. **Collaboration:** Partner with ASMR creators

### Advanced Features

1. **Analytics Dashboard:** Track performance across platforms
2. **A/B Testing:** Test different prompts and styles
3. **Content Planning:** Schedule themed content
4. **Community Integration:** User-suggested objects
5. **Monetization:** Affiliate links, sponsorships

### Template Evolution

The FlowRune will evolve with:
- New AI models and capabilities
- Enhanced video generation features
- Additional social media platforms
- Community feedback integration
- Performance optimizations

---

## 📜 License & Usage

### Template License

This FlowRune template is provided under the RuneFlow Starter Pack license:
- ✅ Commercial use allowed
- ✅ Modification permitted
- ✅ Distribution allowed
- ✅ Private use encouraged

### Attribution

When sharing or modifying:
- Credit RuneFlow.co
- Include the FlowRune rune (ᛚᚱ)
- Link to https://runeflow.co
- Join our community

---

## 🔮 Final Words

The FlowRune represents the perfect fusion of ancient wisdom and modern technology. Like the flow of water (Laguz) meeting the journey of travel (Raidho), this template creates a continuous stream of viral content that travels across the digital realm.

**May your content flow like water and journey like the wind.**

*The RuneFlow Masters*

---

### 🏷️ Template Information

- **Rune:** ᛚᚱ (Laguz-Raidho)
- **Version:** 1.0.0
- **Category:** AI & Research
- **Difficulty:** Intermediate
- **Setup Time:** 15 minutes
- **Maintenance:** Low
- **Scalability:** High
- **Value:** $97

### 📊 Technical Specifications

- **Execution Time:** ~8 minutes per run
- **Success Rate:** 98%+
- **Error Rate:** <2%
- **Scalability:** Unlimited runs
- **Platforms:** YouTube, Instagram, TikTok
- **APIs:** OpenRouter, Fal AI, Blotato, Google Sheets

---

*"Ancient Power. Modern Automation." - RuneFlow.co*
