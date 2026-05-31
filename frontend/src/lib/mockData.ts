export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  author: string;
  date: string;
  category: string;
  imageUrl?: string;
}

export interface Newspaper {
  id: string;
  name: string;
  author: string;
  viewCount: number;
  date: string;
  layout: any; // We'll keep layout schema simple for mock
  articles: NewsArticle[];
}

export const mockArticles: NewsArticle[] = [
  {
    id: "1",
    title: "The Future of AI in Daily Life",
    summary: "AI is becoming increasingly integrated into our daily routines, from smart home devices to personalized news feeds.",
    fullContent: "Artificial Intelligence has transitioned from science fiction to everyday reality. Smart assistants manage our schedules, recommendation algorithms curate our entertainment, and machine learning models optimize our commutes. As these technologies become more sophisticated, they will continue to fade into the background, seamlessly anticipating our needs and augmenting our capabilities. The challenge now lies in ensuring these systems remain transparent, unbiased, and respectful of user privacy.",
    author: "Jane Doe",
    date: "2026-05-31",
    category: "Technology",
  },
  {
    id: "2",
    title: "Global Markets Rally Amidst Tech Boom",
    summary: "Stock markets hit record highs today as major technology firms report better-than-expected earnings for Q2.",
    fullContent: "Investors showed renewed confidence in the technology sector today, driving major indices to unprecedented highs. Analysts attribute the surge to strong quarterly reports from leading software and hardware companies, alongside promising developments in clean energy technologies. While some economists warn of a potential bubble, the general consensus remains optimistic, citing solid fundamentals and continued innovation driving growth.",
    author: "John Smith",
    date: "2026-05-30",
    category: "Finance",
  },
  {
    id: "3",
    title: "New Culinary Trends: Minimalist Cooking",
    summary: "A new wave of chefs is advocating for 'minimalist cooking', focusing on fewer ingredients with higher quality.",
    fullContent: "The culinary world is experiencing a shift towards simplicity. 'Minimalist cooking' emphasizes the use of three to five high-quality, seasonal ingredients per dish, allowing the natural flavors to shine. This movement is partly a reaction against overly complex, molecular gastronomy techniques. Proponents argue that it not only results in more delicious and honest food but also promotes sustainability by encouraging local sourcing and reducing food waste.",
    author: "Alice Johnson",
    date: "2026-05-29",
    category: "Food",
  },
  {
    id: "4",
    title: "Exploring the Deep Sea: New Discoveries",
    summary: "Marine biologists have discovered several new species in the Marianas Trench, shedding light on deep-sea ecosystems.",
    fullContent: "A recent expedition to the Marianas Trench has yielded fascinating results. Using advanced submersibles, researchers have documented several previously unknown species adapted to extreme pressure and darkness. These discoveries are crucial for understanding the biodiversity of the deep ocean and how life can thrive in such harsh environments. The findings also highlight the urgent need to protect these fragile ecosystems from the potential impacts of deep-sea mining.",
    author: "Dr. Robert Lee",
    date: "2026-05-28",
    category: "Science",
  }
];

export const mockFeed: Newspaper[] = [
  {
    id: "n1",
    name: "Tech Today",
    author: "Alex Morgan",
    viewCount: 15420,
    date: "2026-05-31",
    layout: {},
    articles: [mockArticles[0], mockArticles[1]]
  },
  {
    id: "n2",
    name: "Culinary Delights",
    author: "Chef Gordon",
    viewCount: 8900,
    date: "2026-05-30",
    layout: {},
    articles: [mockArticles[2]]
  },
  {
    id: "n3",
    name: "Science Digest",
    author: "Science Weekly",
    viewCount: 22100,
    date: "2026-05-29",
    layout: {},
    articles: [mockArticles[3], mockArticles[0]]
  },
  {
    id: "n4",
    name: "Global Finance",
    author: "Market Watcher",
    viewCount: 5600,
    date: "2026-05-31",
    layout: {},
    articles: [mockArticles[1]]
  }
];
