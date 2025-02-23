export const generateCompletion = async (userMessage) => {
    const url = 'https://api.hyperbolic.xyz/v1/chat/completions';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5hbmFwZWVqYXlAZ21haWwuY29tIn0.vWoMikICbnjyC_EvnG3LFk4KEzjZxBMKSs616bZkl84',
        },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 10000,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        }),
      });
  
      const json = await response.json();
      
      if (!json.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format');
      }
  
      return json.choices[0].message.content;
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  }