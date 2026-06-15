const axios = require('axios');

exports.generateRichData = async (req, res) => {
  try {
    const { name, category, city, experience } = req.body;
    
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured in .env' });
    }

    const prompt = `You are an expert wedding marketplace copywriter. 
Generate a JSON object with rich data for the following wedding vendor:
Name: ${name}
Category: ${category}
City: ${city}
Experience: ${experience || 'Not specified'}

The JSON object must have exactly these keys:
1. "bio": A beautiful, engaging 2-paragraph about us description.
2. "faqs": An array of 5 common questions and answers. Format: [{"q": "...", "a": "..."}]

Return ONLY raw JSON, without markdown formatting or code blocks.`;

    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    res.json(parsedData);
  } catch (error) {
    console.error('DeepSeek AI Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate rich data. Check API key and logs.' });
  }
};
