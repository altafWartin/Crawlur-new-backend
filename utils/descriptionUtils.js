// utils/descriptionUtils.js
const { OpenAI } = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CONFIG = {
  model: "gpt-3.5-turbo",
  max_tokens: 150,
  temperature: 0.7,
  top_p: 1,
};

async function rewriteDescription(descriptions) {
  console.log("descriptions", descriptions);
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
  let allDescriptions = [];

  try {
    for (const description of descriptions[0][0]) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: "user",
            content: `Rewrite the following product description in a simple manner without any business or technical jargon:\n\n${description}. 
              Once completed, organize it into a short summary description with salient features in 
              numbered bullet points. Organize the output in a valid JSON format and return the JSON.
              Follow this JSON format: [{"summary":"put 2 line summary here"},{"put feature name here like quality or something":"feature description here"}]  Do not return any other text. Remove all \\ or / Absolutely do not insert \`\`\`json or \`\`\` or \``,
          },
        ],
        stream: false,
        max_tokens: OPENAI_CONFIG.max_tokens,
        temperature: OPENAI_CONFIG.temperature,
        top_p: OPENAI_CONFIG.top_p,
      });

      // Log the raw response content for debugging
      const responseContent = completion.choices[0].message.content.trim();
      console.log("Raw response content:", responseContent);

      // Clean up the response content to ensure valid JSON format
      let cleanedResponseContent = responseContent
        .replace(/^\[|\]$/g, '')  // Remove surrounding brackets
        .replace(/,\s*(}|\])/g, '$1')  // Remove trailing commas before closing brackets
        .replace(/(\w+):/g, '"$1":')  // Add double quotes around keys
        .replace(/\\\/|\\/g, '')  // Remove any misplaced backslashes
        .replace(/(?<!")"(?!")/g, '"');  // Fix mismatched quotes

      // Ensure proper JSON format
      cleanedResponseContent = `[${cleanedResponseContent}]`;

      // Validate JSON format before parsing
      try {
        const rewrittenDescription = JSON.parse(cleanedResponseContent);
        allDescriptions.push(rewrittenDescription);
      } catch (jsonError) {
        console.error("Invalid JSON response:", cleanedResponseContent);
        throw new Error("Failed to parse JSON response");
      }
    }

    console.log("allDescriptions", allDescriptions);
    return allDescriptions;
  } catch (error) {
    console.error("Error rewriting description:", error);
    throw new Error("Failed to rewrite descriptions");
  }
}

module.exports = {
  rewriteDescription,
};
