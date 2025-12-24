const Anthropic = require('@anthropic-ai/sdk');
const RCA = require('../models/RCA');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Helper function to call Claude API
const callClaudeAPI = async (systemPrompt, userMessage) => {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('AI service temporarily unavailable');
  }
};

// @desc    Get AI suggestions for similar past RCAs
// @route   POST /api/ai/similarity
// @access  Public
exports.findSimilarRCAs = async (req, res) => {
  try {
    const { title, symptoms } = req.body;

    if (!title && !symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title or symptoms to find similar RCAs'
      });
    }

    // First, search for potentially similar RCAs in database
    const searchTerms = `${title} ${symptoms}`.trim();
    let existingRCAs = [];

    try {
      existingRCAs = await RCA.find({
        $or: [
          { title: { $regex: searchTerms.split(' ').join('|'), $options: 'i' } },
          { symptoms: { $regex: searchTerms.split(' ').join('|'), $options: 'i' } }
        ]
      }).limit(5);
    } catch (dbError) {
      console.log('DB search fallback:', dbError.message);
    }

    // If no API key, return database results only
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(200).json({
        success: true,
        data: {
          similarRCAs: existingRCAs,
          aiSuggestion: 'AI suggestions unavailable. Configure ANTHROPIC_API_KEY to enable AI features.',
          source: 'database'
        }
      });
    }

    // Prepare context from existing RCAs for AI analysis
    const rcaContext = existingRCAs.length > 0 
      ? existingRCAs.map(rca => `
        Title: ${rca.title}
        Category: ${rca.category}
        Symptoms: ${rca.symptoms}
        Root Cause: ${rca.rootCause}
        Solution: ${rca.solution}
      `).join('\n---\n')
      : 'No existing RCAs found in the database.';

    const systemPrompt = `You are an IT incident analyst assistant. Your job is to help identify similar past issues and suggest solutions based on historical data. Be concise and practical.`;

    const userMessage = `
A user is reporting a new issue:
Title: ${title || 'Not provided'}
Symptoms: ${symptoms || 'Not provided'}

Here are potentially similar past RCAs from our database:
${rcaContext}

Please analyze and provide:
1. Are any of the existing RCAs similar to this new issue? (Yes/No and brief explanation)
2. If similar issues exist, what was the likely root cause?
3. What solution would you suggest based on past incidents?
4. Any additional investigation steps recommended?

Keep your response brief and actionable.`;

    const aiResponse = await callClaudeAPI(systemPrompt, userMessage);

    res.status(200).json({
      success: true,
      data: {
        similarRCAs: existingRCAs,
        aiSuggestion: aiResponse,
        source: 'ai-enhanced'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to find similar RCAs',
      error: error.message
    });
  }
};

// @desc    Get AI assistance to improve RCA input
// @route   POST /api/ai/assist
// @access  Public
exports.assistRCACreation = async (req, res) => {
  try {
    const { field, value, context } = req.body;

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: 'Please provide field name and value for assistance'
      });
    }

    // If no API key, return helpful default suggestions
    if (!process.env.ANTHROPIC_API_KEY) {
      const defaultSuggestions = {
        title: 'Consider making the title more specific. Include the affected system and impact.',
        symptoms: 'List observable symptoms: error messages, performance metrics, user reports.',
        rootCause: 'Identify the underlying technical reason. Ask "why" 5 times to dig deeper.',
        solution: 'Document step-by-step resolution. Include commands, configurations, or code changes.',
        prevention: 'Consider monitoring, alerts, or process changes to prevent recurrence.'
      };

      return res.status(200).json({
        success: true,
        data: {
          originalValue: value,
          suggestion: defaultSuggestions[field] || 'Provide clear, specific details.',
          improved: value,
          warnings: [],
          source: 'default'
        }
      });
    }

    const systemPrompt = `You are an expert IT incident analyst helping users write better Root Cause Analysis (RCA) documents. Provide practical, concise suggestions. Do not use markdown formatting.`;

    let userMessage = '';

    switch (field) {
      case 'title':
        userMessage = `The user entered this issue title: "${value}"
        
Please:
1. Suggest a clearer, more specific title if needed
2. Identify if important details are missing (affected system, impact, timeframe)
3. Keep suggestions brief`;
        break;

      case 'symptoms':
        userMessage = `The user described these symptoms: "${value}"
        
Context: ${context || 'None provided'}
        
Please:
1. Identify if symptoms are clear and measurable
2. Suggest additional symptoms to document
3. Distinguish symptoms from root causes if confused`;
        break;

      case 'rootCause':
        userMessage = `The user identified this root cause: "${value}"
        
Symptoms were: ${context || 'Not provided'}
        
Please:
1. Check if this is truly a root cause or just another symptom
2. Suggest ways to verify this root cause
3. If it looks like a symptom, suggest what the actual root cause might be
4. Warn if the root cause seems incomplete`;
        break;

      case 'solution':
        userMessage = `The user documented this solution: "${value}"
        
Root cause was: ${context || 'Not provided'}
        
Please:
1. Check if the solution addresses the root cause
2. Suggest any missing steps
3. Recommend verification steps`;
        break;

      case 'prevention':
        userMessage = `The user suggested this prevention: "${value}"
        
Root cause was: ${context || 'Not provided'}
        
Please:
1. Evaluate if prevention is practical
2. Suggest additional preventive measures
3. Recommend monitoring or alerts`;
        break;

      default:
        userMessage = `Help improve this RCA field (${field}): "${value}"`;
    }

    const aiResponse = await callClaudeAPI(systemPrompt, userMessage);

    // Parse AI response for structured output
    res.status(200).json({
      success: true,
      data: {
        originalValue: value,
        suggestion: aiResponse,
        field: field,
        source: 'ai-enhanced'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI assistance',
      error: error.message
    });
  }
};

// @desc    Validate if root cause looks like a symptom
// @route   POST /api/ai/validate-rootcause
// @access  Public
exports.validateRootCause = async (req, res) => {
  try {
    const { rootCause, symptoms } = req.body;

    if (!rootCause) {
      return res.status(400).json({
        success: false,
        message: 'Please provide root cause to validate'
      });
    }

    // If no API key, provide basic validation
    if (!process.env.ANTHROPIC_API_KEY) {
      const symptomKeywords = ['error', 'failed', 'slow', 'down', 'not working', 'timeout', 'crash'];
      const isLikelySymptom = symptomKeywords.some(keyword => 
        rootCause.toLowerCase().includes(keyword)
      );

      return res.status(200).json({
        success: true,
        data: {
          isValid: !isLikelySymptom,
          confidence: 'low',
          feedback: isLikelySymptom 
            ? 'This might be a symptom rather than a root cause. Try asking "why did this happen?" to dig deeper.'
            : 'This looks like it could be a valid root cause.',
          source: 'heuristic'
        }
      });
    }

    const systemPrompt = `You are an IT incident analysis expert. Determine if a stated "root cause" is actually a root cause or if it's really just a symptom. Be direct and concise.`;

    const userMessage = `
Stated Root Cause: "${rootCause}"
Related Symptoms: "${symptoms || 'Not provided'}"

Analyze:
1. Is this truly a ROOT CAUSE (the underlying reason) or is it actually a SYMPTOM (an observable effect)?
2. Confidence level (High/Medium/Low)
3. If it's a symptom, suggest what the actual root cause might be
4. Provide a one-line recommendation

Format your response as:
VERDICT: [Root Cause / Symptom / Unclear]
CONFIDENCE: [High/Medium/Low]
REASONING: [Brief explanation]
SUGGESTION: [What to do next]`;

    const aiResponse = await callClaudeAPI(systemPrompt, userMessage);

    // Parse the response
    const isSymptom = aiResponse.toLowerCase().includes('verdict: symptom') || 
                      aiResponse.toLowerCase().includes('verdict:symptom');

    res.status(200).json({
      success: true,
      data: {
        isValid: !isSymptom,
        analysis: aiResponse,
        source: 'ai-enhanced'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate root cause',
      error: error.message
    });
  }
};

// @desc    Generate RCA summary/report
// @route   POST /api/ai/summarize
// @access  Public
exports.generateSummary = async (req, res) => {
  try {
    const { rcaId } = req.body;

    const rca = await RCA.findById(rcaId);
    if (!rca) {
      return res.status(404).json({
        success: false,
        message: 'RCA not found'
      });
    }

    // If no API key, return basic summary
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(200).json({
        success: true,
        data: {
          summary: `Issue: ${rca.title}\nCategory: ${rca.category}\nRoot Cause: ${rca.rootCause}\nResolution: ${rca.solution}`,
          source: 'basic'
        }
      });
    }

    const systemPrompt = `You are a technical writer. Create concise, professional incident summaries suitable for stakeholder communication.`;

    const userMessage = `
Create a brief executive summary for this incident:

Title: ${rca.title}
Category: ${rca.category}
Severity: ${rca.severity}
Symptoms: ${rca.symptoms}
Root Cause: ${rca.rootCause}
Solution: ${rca.solution}
Prevention: ${rca.prevention}

Provide a 3-4 sentence summary suitable for a status update or incident report.`;

    const aiResponse = await callClaudeAPI(systemPrompt, userMessage);

    res.status(200).json({
      success: true,
      data: {
        summary: aiResponse,
        rca: rca,
        source: 'ai-enhanced'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
};
