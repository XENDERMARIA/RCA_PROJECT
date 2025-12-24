const Anthropic = require('@anthropic-ai/sdk');
const RCA = require('../models/RCA');

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
}) : null;

// Helper function to call Claude API
const callClaudeAPI = async (systemPrompt, userMessage) => {
  if (!anthropic) {
    return null;
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    return null;
  }
};

// @desc    Search for solutions based on user's problem
// @route   POST /api/solver/search
// @access  Public
exports.searchSolutions = async (req, res) => {
  try {
    const { problem, category, additionalDetails } = req.body;

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: 'Please describe your problem'
      });
    }

    // Step 1: Search database for similar RCAs using multiple strategies
    const searchTerms = problem.split(' ').filter(word => word.length > 3);
    
    // Strategy 1: Text search
    let matchedRCAs = [];
    try {
      matchedRCAs = await RCA.find(
        { $text: { $search: problem } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);
    } catch (err) {
      // Fallback to regex search if text index doesn't exist
      const regexPattern = searchTerms.join('|');
      matchedRCAs = await RCA.find({
        $or: [
          { title: { $regex: regexPattern, $options: 'i' } },
          { symptoms: { $regex: regexPattern, $options: 'i' } },
          { rootCause: { $regex: regexPattern, $options: 'i' } },
          { solution: { $regex: regexPattern, $options: 'i' } },
          { tags: { $in: searchTerms.map(t => new RegExp(t, 'i')) } }
        ]
      }).limit(10);
    }

    // Strategy 2: Category-based search if category provided
    if (category && category !== 'All') {
      const categoryRCAs = await RCA.find({ category })
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Merge results, avoiding duplicates
      categoryRCAs.forEach(rca => {
        if (!matchedRCAs.find(m => m._id.toString() === rca._id.toString())) {
          matchedRCAs.push(rca);
        }
      });
    }

    // Step 2: Use AI to analyze and rank solutions
    let aiAnalysis = null;
    let suggestedSolution = null;
    let confidence = 'low';
    let troubleshootingSteps = [];

    if (matchedRCAs.length > 0) {
      // Prepare RCA context for AI
      const rcaContext = matchedRCAs.slice(0, 5).map((rca, idx) => `
RCA #${idx + 1}:
- Title: ${rca.title}
- Category: ${rca.category}
- Symptoms: ${rca.symptoms}
- Root Cause: ${rca.rootCause}
- Solution: ${rca.solution}
- Prevention: ${rca.prevention || 'Not specified'}
`).join('\n---\n');

      const systemPrompt = `You are an expert IT support assistant. Your job is to help users solve technical problems by analyzing past incident records (RCAs) and providing actionable guidance.

Be practical, specific, and helpful. Format your response as structured guidance that a user can follow step-by-step.`;

      const userPrompt = `
A user is experiencing this problem:
"${problem}"
${additionalDetails ? `Additional details: ${additionalDetails}` : ''}
${category ? `Category: ${category}` : ''}

Here are similar past incidents from our knowledge base:
${rcaContext}

Please analyze and provide:
1. MATCH ASSESSMENT: How closely do the past RCAs match this problem? (High/Medium/Low confidence)
2. LIKELY ROOT CAUSE: Based on patterns, what's the most likely cause?
3. RECOMMENDED SOLUTION: Step-by-step solution based on past fixes
4. TROUBLESHOOTING STEPS: If the main solution doesn't work, what else to try
5. QUESTIONS TO ASK: What additional info would help diagnose this better?

Format your response clearly with these sections.`;

      aiAnalysis = await callClaudeAPI(systemPrompt, userPrompt);

      // Parse AI response for confidence level
      if (aiAnalysis) {
        if (aiAnalysis.toLowerCase().includes('high confidence') || 
            aiAnalysis.toLowerCase().includes('match assessment: high')) {
          confidence = 'high';
        } else if (aiAnalysis.toLowerCase().includes('medium confidence') ||
                   aiAnalysis.toLowerCase().includes('match assessment: medium')) {
          confidence = 'medium';
        }
      }
    }

    // Step 3: Generate basic suggestions even without AI
    if (!aiAnalysis && matchedRCAs.length > 0) {
      // Provide basic matching without AI
      const bestMatch = matchedRCAs[0];
      aiAnalysis = `Based on keyword matching, we found ${matchedRCAs.length} potentially related issue(s).

**Most Similar Issue:** ${bestMatch.title}

**Symptoms from past incident:** 
${bestMatch.symptoms}

**Root Cause was:** 
${bestMatch.rootCause}

**Solution that worked:**
${bestMatch.solution}

${bestMatch.prevention ? `**Prevention tips:** ${bestMatch.prevention}` : ''}

Please review if this matches your situation. If not, try providing more details about your problem.`;
      confidence = 'medium';
    }

    // Step 4: If no matches found
    if (matchedRCAs.length === 0) {
      // Try AI for general guidance
      if (anthropic) {
        const generalPrompt = `A user is experiencing this technical problem: "${problem}"
${additionalDetails ? `Additional details: ${additionalDetails}` : ''}
${category ? `Category: ${category}` : ''}

We don't have any similar past incidents in our database. Please provide:
1. General troubleshooting steps for this type of issue
2. Common causes for such problems
3. What information would help diagnose this
4. Recommendation to document this as a new RCA once solved

Keep it practical and actionable.`;

        aiAnalysis = await callClaudeAPI(
          'You are a helpful IT support assistant providing general troubleshooting guidance.',
          generalPrompt
        );
      }
      
      if (!aiAnalysis) {
        aiAnalysis = `No similar issues found in our knowledge base. This might be a new type of problem.

**Recommendations:**
1. Check system logs for error messages
2. Verify recent changes (deployments, configs, updates)
3. Check resource utilization (CPU, memory, disk, network)
4. Try restarting the affected service/component
5. Document your findings for future reference

Once you solve this issue, please create an RCA to help others who face similar problems!`;
      }
      
      confidence = 'low';
    }

    res.status(200).json({
      success: true,
      data: {
        matchedRCAs: matchedRCAs.slice(0, 5),
        totalMatches: matchedRCAs.length,
        aiAnalysis,
        confidence,
        searchedProblem: problem
      }
    });

  } catch (error) {
    console.error('Search solutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for solutions',
      error: error.message
    });
  }
};

// @desc    Get guided troubleshooting for a specific matched RCA
// @route   POST /api/solver/guide
// @access  Public
exports.getGuidedHelp = async (req, res) => {
  try {
    const { rcaId, userProblem, userContext } = req.body;

    const rca = await RCA.findById(rcaId);
    if (!rca) {
      return res.status(404).json({
        success: false,
        message: 'RCA not found'
      });
    }

    let guidance = null;

    if (anthropic) {
      const systemPrompt = `You are a helpful IT support guide. Based on a past incident record, help the user solve their current problem with clear, step-by-step instructions.`;

      const userPrompt = `
The user's current problem: "${userProblem}"
${userContext ? `Additional context: ${userContext}` : ''}

This past incident seems relevant:
- Title: ${rca.title}
- Category: ${rca.category}
- Past Symptoms: ${rca.symptoms}
- Root Cause: ${rca.rootCause}
- Solution Applied: ${rca.solution}
- Prevention: ${rca.prevention || 'Not documented'}

Please provide:
1. How to verify if this is the same issue (diagnostic steps)
2. Step-by-step solution adapted to the user's context
3. How to verify the fix worked
4. What to do if this doesn't solve it
5. Preventive measures to avoid recurrence

Be specific and actionable.`;

      guidance = await callClaudeAPI(systemPrompt, userPrompt);
    }

    if (!guidance) {
      guidance = `**Guided Solution Based on Past Incident**

**Step 1: Verify the Problem**
Compare your symptoms with the past incident:
- Past symptoms: ${rca.symptoms}

**Step 2: Apply the Solution**
${rca.solution}

**Step 3: Verify the Fix**
- Test the affected functionality
- Monitor for recurrence
- Check logs for any remaining errors

**Step 4: If Not Resolved**
- The root cause might be different
- Document what you tried
- Consider creating a new RCA

**Prevention:**
${rca.prevention || 'Document preventive measures once resolved'}`;
    }

    res.status(200).json({
      success: true,
      data: {
        rca,
        guidance
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get guided help',
      error: error.message
    });
  }
};

// @desc    Have a conversation to diagnose the problem
// @route   POST /api/solver/chat
// @access  Public
exports.chatDiagnose = async (req, res) => {
  try {
    const { messages } = req.body;

    // Get the last user message
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';

    if (!lastUserMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please send a message'
      });
    }

    // Check if AI is configured
    if (!anthropic) {
      // Fallback response without AI
      const fallbackResponses = {
        greeting: `Hello! 👋 I'm your RCA Assistant. I'm here to help you troubleshoot technical issues.

Unfortunately, AI features are not configured yet. But you can still:
• Search for solutions using Quick Search mode
• Browse the Knowledge Base for past incidents
• Create new RCAs to document issues

How can I help you today?`,
        default: `I understand you're saying: "${lastUserMessage}"

To help you better, I need the AI features to be enabled. Please configure the ANTHROPIC_API_KEY in the backend .env file.

In the meantime, try using Quick Search mode to find solutions!`
      };

      const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)/i.test(lastUserMessage.trim());
      
      return res.status(200).json({
        success: true,
        data: {
          response: isGreeting ? fallbackResponses.greeting : fallbackResponses.default,
          relevantRCAs: [],
          source: 'fallback'
        }
      });
    }

    // Search for relevant RCAs (only for non-greeting messages)
    let relevantRCAs = [];
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings|thanks|thank you|ok|okay|yes|no|bye|goodbye)/i.test(lastUserMessage.trim());
    
    if (!isGreeting && lastUserMessage.length > 5) {
      try {
        // Try text search first
        relevantRCAs = await RCA.find(
          { $text: { $search: lastUserMessage } },
          { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(3);
      } catch (err) {
        // Fallback to regex search
        try {
          const searchTerms = lastUserMessage.split(' ').filter(w => w.length > 3);
          if (searchTerms.length > 0) {
            relevantRCAs = await RCA.find({
              $or: [
                { title: { $regex: searchTerms.join('|'), $options: 'i' } },
                { symptoms: { $regex: searchTerms.join('|'), $options: 'i' } },
                { rootCause: { $regex: searchTerms.join('|'), $options: 'i' } }
              ]
            }).limit(3);
          }
        } catch (fallbackErr) {
          console.log('Search fallback also failed:', fallbackErr.message);
        }
      }
    }

    // Build context from relevant RCAs
    const rcaContext = relevantRCAs.length > 0 
      ? `\n\nI found these relevant past incidents in our knowledge base that might help:\n${relevantRCAs.map((r, i) => 
          `${i + 1}. "${r.title}" - Root cause: ${r.rootCause.substring(0, 100)}...`
        ).join('\n')}`
      : '';

    // System prompt for conversational AI assistant
    const systemPrompt = `You are a friendly and helpful IT Support Assistant chatbot. Your name is "RCA Bot".

Your personality:
- Friendly and conversational (use casual language, emojis occasionally)
- Patient and understanding
- Knowledgeable about IT issues
- Helpful in diagnosing problems step by step

Your capabilities:
- Help users troubleshoot technical problems
- Guide them through diagnostic steps
- Suggest solutions based on past incidents
- Help document new issues as RCAs

How to behave:
- For greetings (hi, hello, etc.): Respond warmly and ask how you can help
- For technical problems: Ask clarifying questions, then provide step-by-step guidance
- For thanks/goodbye: Respond politely
- Always be encouraging and supportive

${rcaContext ? `Knowledge Base Context: ${rcaContext}` : ''}

Remember: You're having a natural conversation. Don't be robotic. Be helpful like a friendly colleague who knows about IT issues.`;

    // Prepare messages for API - only send user messages, let system prompt guide the assistant
    // Anthropic requires alternating user/assistant messages starting with user
    let apiMessages = [];
    
    // Build conversation history properly
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        // If previous message was also user, skip (shouldn't happen but safety check)
        if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === 'user') {
          continue;
        }
        apiMessages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant' && !msg.isError) {
        // Only add assistant messages if there's a user message before
        if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === 'user') {
          apiMessages.push({ role: 'assistant', content: msg.content });
        }
      }
    }

    // Ensure we have at least the last user message
    if (apiMessages.length === 0 || apiMessages[apiMessages.length - 1].role !== 'user') {
      apiMessages.push({ role: 'user', content: lastUserMessage });
    }

    // Ensure first message is from user
    while (apiMessages.length > 0 && apiMessages[0].role !== 'user') {
      apiMessages.shift();
    }

    // If still empty, just use the last user message
    if (apiMessages.length === 0) {
      apiMessages = [{ role: 'user', content: lastUserMessage }];
    }

    console.log('📤 Sending to Claude:', JSON.stringify({ messageCount: apiMessages.length, lastMessage: lastUserMessage.substring(0, 50) }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages
    });

    const aiResponse = response.content[0].text;
    console.log('📥 Claude responded:', aiResponse.substring(0, 100) + '...');

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        relevantRCAs,
        source: 'ai'
      }
    });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    console.error('Full error:', error);
    
    // Provide helpful error messages
    let userMessage = 'Sorry, I encountered an error. Please try again!';
    
    if (error.message?.includes('API key')) {
      userMessage = 'Oops! My AI brain is not connected properly. Please check the API key configuration.';
    } else if (error.message?.includes('rate limit')) {
      userMessage = 'I\'m a bit overwhelmed right now. Please wait a moment and try again.';
    } else if (error.status === 401) {
      userMessage = 'My API key seems to be invalid. Please check the configuration.';
    }
    
    res.status(200).json({  // Return 200 so frontend doesn't show error toast
      success: true,
      data: {
        response: userMessage + '\n\n_Error details: ' + error.message + '_',
        relevantRCAs: [],
        source: 'error'
      }
    });
  }
};

// @desc    Mark a solution as helpful and optionally add learning
// @route   POST /api/solver/feedback
// @access  Public
exports.submitFeedback = async (req, res) => {
  try {
    const { rcaId, helpful, problemDescription, actualSolution, createNewRCA } = req.body;

    // If solution was helpful, we could track this for ranking
    if (rcaId && helpful) {
      // In a production system, you might track helpfulness scores
      // For now, we just acknowledge
      console.log(`RCA ${rcaId} was marked as helpful`);
    }

    // If user wants to create a new RCA from their solved problem
    if (createNewRCA && problemDescription && actualSolution) {
      // Use AI to structure the RCA
      let structuredRCA = {
        title: problemDescription.substring(0, 100),
        category: 'Other',
        symptoms: problemDescription,
        rootCause: 'To be determined',
        solution: actualSolution,
        prevention: '',
        severity: 'Medium',
        status: 'Resolved',
        tags: ['auto-generated', 'from-solver'],
        createdBy: 'Problem Solver'
      };

      if (anthropic) {
        const structurePrompt = `Based on this problem and solution, create a structured RCA:

Problem: ${problemDescription}
Solution: ${actualSolution}

Provide a JSON response with:
{
  "title": "concise title",
  "category": "one of: Server, Database, Network, App, Security, Other",
  "symptoms": "observable symptoms",
  "rootCause": "underlying cause",
  "solution": "step-by-step solution",
  "prevention": "how to prevent recurrence",
  "severity": "Low, Medium, High, or Critical",
  "tags": ["relevant", "tags"]
}`;

        try {
          const aiResponse = await callClaudeAPI(
            'You are a technical writer creating structured incident reports. Return only valid JSON.',
            structurePrompt
          );
          
          if (aiResponse) {
            // Try to parse JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              structuredRCA = {
                ...structuredRCA,
                ...parsed,
                status: 'Resolved',
                createdBy: 'Problem Solver'
              };
            }
          }
        } catch (parseError) {
          console.log('Could not parse AI response, using defaults');
        }
      }

      // Create the new RCA
      const newRCA = await RCA.create(structuredRCA);

      return res.status(201).json({
        success: true,
        message: 'Thank you for your feedback! A new RCA has been created.',
        data: {
          feedbackRecorded: true,
          newRCA
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        feedbackRecorded: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// @desc    Get quick suggestions as user types (autocomplete)
// @route   GET /api/solver/suggest
// @access  Public
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 3) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Find matching RCA titles and symptoms
    const suggestions = await RCA.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { symptoms: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title symptoms category')
    .limit(5);

    const formattedSuggestions = suggestions.map(s => ({
      id: s._id,
      title: s.title,
      preview: s.symptoms.substring(0, 100) + '...',
      category: s.category
    }));

    res.status(200).json({
      success: true,
      data: formattedSuggestions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};
