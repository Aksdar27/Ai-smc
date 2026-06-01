import axios from 'axios';

export async function checkNewsBlock(): Promise<{ isBlocked: boolean; nextNews?: string; impact?: string }> {
  try {
    // Basic NewsAPI check
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return { isBlocked: false }; // no API key, skip

    // In a real app we'd query forex factory calendar API, 
    // but building an approximation with NewsAPI or just mock pass if no specific forex calendar
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Federal Reserve OR FOMC OR CPI OR NFP OR Gold OR "Interest Rate"',
        from: today,
        sortBy: 'publishedAt',
        apiKey: apiKey
      },
      timeout: 5000
    });

    if (response.data && response.data.articles && response.data.articles.length > 0) {
      const topNews = response.data.articles[0];
      const publishedAt = new Date(topNews.publishedAt);
      const now = new Date();
      const diffMinutes = Math.abs(now.getTime() - publishedAt.getTime()) / (1000 * 60);

      // Block window: 15 mins before/after
      if (diffMinutes <= 15) {
        return { 
          isBlocked: true, 
          nextNews: topNews.title,
          impact: 'HIGH' 
        };
      }
    }
    
    return { isBlocked: false };
  } catch (err) {
    console.error('NewsAPI Error', err);
    return { isBlocked: false };
  }
}
