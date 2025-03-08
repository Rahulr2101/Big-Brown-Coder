import axios from 'axios';

// Function to analyze sentiment using FinGPT model
export const analyzeSentiment = async (text) => {
  try {
    // For production use, connect to your actual model API
    // This could be a Hugging Face Inference API, a self-hosted model,
    // or another NLP service depending on your setup
    
    // Example with Hugging Face:
    /*
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/FinGPT/fingpt-sentiment_internlm-20b_lora',
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Parse the model response (adjust based on your model's output format)
    const result = response.data;
    return {
      label: result[0].label,
      confidence: [
        result[0].score, // Assuming model returns scores in order: positive, neutral, negative
        result[1].score,
        result[2].score,
      ],
    };
    */
    
    // For development/demo: Enhanced simulated sentiment analysis
    // In a real app, replace this with your actual model API call
    
    const lowerText = text.toLowerCase();
    
    // Expanded word lists for better detection
    const positiveWords = [
      'gain', 'growth', 'profit', 'success', 'up', 'record', 'beat', 'positive', 'exceeding',
      'soar', 'surge', 'jump', 'climb', 'rally', 'outperform', 'exceed', 'boost', 'strong', 
      'bullish', 'opportunity', 'potential', 'breakthrough', 'innovative', 'leadership',
      'increase', 'expand', 'advance', 'upgrade', 'recommend', 'buy', 'target', 'dividend'
    ];
    
    const negativeWords = [
      'fall', 'drop', 'loss', 'down', 'fail', 'decline', 'miss', 'negative', 'risk', 'issue',
      'plunge', 'crash', 'tumble', 'slump', 'bearish', 'weak', 'poor', 'disappoint', 'concern',
      'struggle', 'problem', 'challenge', 'lawsuit', 'investigation', 'recall', 'layoff',
      'debt', 'sell', 'downgrade', 'warning', 'bankruptcy', 'cut', 'underperform', 'decrease'
    ];
    
    // Starting scores with higher baselines to reduce neutral classifications
    let positiveScore = 0.18 + (Math.random() * 0.25); // Start with 0.18-0.43
    let negativeScore = 0.18 + (Math.random() * 0.25); // Start with 0.18-0.43
    
    // Count sentiment words with increased weighted scoring
    positiveWords.forEach(word => {
      // Higher score for exact word matches
      if (lowerText.includes(` ${word} `)) positiveScore += 0.20;
      // Lower score for partial matches
      else if (lowerText.includes(word)) positiveScore += 0.12;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(` ${word} `)) negativeScore += 0.20;
      else if (lowerText.includes(word)) negativeScore += 0.12;
    });
    
    // Adjust cap to allow for higher sentiment scores
    positiveScore = Math.min(0.90, positiveScore);
    negativeScore = Math.min(0.90, negativeScore);
    
    // Adjusted text length factor - less aggressive dampening for longer texts
    if (text.length > 200) {
      positiveScore *= 0.95; // Changed from 0.9
      negativeScore *= 0.95; // Changed from 0.9
    }
    
    // For ticker-specific sentiment bias (for more realistic market news simulation)
    if (lowerText.includes("aapl") || lowerText.includes("apple")) {
      positiveScore *= 1.15; // Increased from 1.1
    }
    if (lowerText.includes("tsla") || lowerText.includes("tesla")) {
      // Tesla news tends to be more volatile
      const volatilityFactor = Math.random() > 0.5 ? 1.25 : 0.75; // More extreme volatility
      positiveScore *= volatilityFactor;
      negativeScore *= 2 - volatilityFactor;
    }
    
    // Calculate neutral score as the remaining probability space
    const neutralScore = Math.max(0, 1 - positiveScore - negativeScore);
    
    // Normalize scores to sum to 1
    const total = positiveScore + negativeScore + neutralScore;
    const normalizedPositive = positiveScore / total;
    const normalizedNeutral = neutralScore / total;
    const normalizedNegative = negativeScore / total;
    
    // Lower threshold for positive/negative classification
    let label = 'neutral';
    if (normalizedPositive > 0.38) {
      label = 'positive';
    } else if (normalizedNegative > 0.38) {
      label = 'negative';
    }
    
    // Add a tie-breaker for close cases to further reduce neutrals
    if (label === 'neutral') {
      // If positive and negative are close to each other and both reasonably high,
      // choose the higher one instead of neutral
      if (Math.abs(normalizedPositive - normalizedNegative) < 0.1 && 
          (normalizedPositive > 0.3 || normalizedNegative > 0.3)) {
        label = normalizedPositive > normalizedNegative ? 'positive' : 'negative';
      }
    }
    
    return {
      label,
      confidence: [normalizedPositive, normalizedNeutral, normalizedNegative]
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return neutral sentiment as fallback, but with slightly stronger positive/negative
    return { 
      label: 'neutral', 
      confidence: [0.35, 0.30, 0.35] // Changed from even distribution
    };
  }
};