// AI Agent Tool Definitions (OpenAI Function Calling format)

// Используем конкретный тип для function tools (не union с custom tools)
export interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

// Определения всех доступных инструментов для AI агента
export const AI_TOOLS: FunctionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_listings',
      description: 'Search rental listings (apartments, houses, rooms) in Da Nang. Use when user asks about rent, housing, apartments, or places to live.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text (optional)',
          },
          category: {
            type: 'string',
            enum: ['apartment', 'house', 'room', 'studio'],
            description: 'Type of rental property',
          },
          priceMin: {
            type: 'number',
            description: 'Minimum price in USD',
          },
          priceMax: {
            type: 'number',
            description: 'Maximum price in USD',
          },
          location: {
            type: 'string',
            description: 'Area/district in Da Nang (e.g., "My Khe", "An Thuong", "Son Tra")',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 5)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_places',
      description: 'Search places (cafes, restaurants, coworkings, gyms, etc) in Da Nang. Use when user asks about where to eat, work, exercise, or hang out.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text (optional)',
          },
          category: {
            type: 'string',
            enum: ['cafe', 'restaurant', 'coworking', 'gym', 'bar', 'spa', 'shop', 'other'],
            description: 'Type of place',
          },
          hasWifi: {
            type: 'boolean',
            description: 'Filter places with WiFi',
          },
          isVegan: {
            type: 'boolean',
            description: 'Filter vegan-friendly places',
          },
          priceLevel: {
            type: 'string',
            enum: ['$', '$$', '$$$'],
            description: 'Price level',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 5)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_market',
      description: 'Search marketplace items (buy/sell goods) from expats in Da Nang. Use when user wants to buy or find second-hand items.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text (optional)',
          },
          category: {
            type: 'string',
            enum: ['electronics', 'furniture', 'vehicles', 'clothing', 'sports', 'other'],
            description: 'Item category',
          },
          condition: {
            type: 'string',
            enum: ['new', 'like_new', 'good', 'fair'],
            description: 'Item condition',
          },
          priceMin: {
            type: 'number',
            description: 'Minimum price in USD',
          },
          priceMax: {
            type: 'number',
            description: 'Maximum price in USD',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 5)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_events',
      description: 'Search events happening in Da Nang. Use when user asks about events, meetups, parties, or activities.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text (optional)',
          },
          category: {
            type: 'string',
            enum: ['social', 'sports', 'business', 'culture', 'party', 'other'],
            description: 'Event category',
          },
          dateFrom: {
            type: 'string',
            description: 'Start date (ISO format)',
          },
          dateTo: {
            type: 'string',
            description: 'End date (ISO format)',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 5)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_favorites',
      description: 'Get user\'s saved/favorited items. Use when user asks about their favorites, saved items, or bookmarks.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['listing', 'place', 'market', 'event', 'all'],
            description: 'Type of favorites to retrieve (default: all)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_community_post',
      description: 'Create a new post in the community feed. Use when user wants to post something, share info, or ask the community.',
      parameters: {
        type: 'object',
        properties: {
          body: {
            type: 'string',
            description: 'Post content/text',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for the post (e.g., ["question", "housing"])',
          },
        },
        required: ['body'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_community_posts',
      description: 'Get recent community posts. Use when user wants to see what\'s happening in the community.',
      parameters: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by tags',
          },
          limit: {
            type: 'number',
            description: 'Max posts to return (default 5)',
          },
        },
        required: [],
      },
    },
  },
];

// Типы для результатов инструментов
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Маппинг имён инструментов на их обработчики
export type ToolName =
  | 'search_listings'
  | 'search_places'
  | 'search_market'
  | 'search_events'
  | 'get_user_favorites'
  | 'create_community_post'
  | 'get_community_posts';
