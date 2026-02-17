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
  {
    type: 'function',
    function: {
      name: 'create_listing',
      description: 'Create a new rental listing (apartment, house, room, bike). Use when user wants to post a rental ad.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the listing',
          },
          description: {
            type: 'string',
            description: 'Detailed description',
          },
          price: {
            type: 'number',
            description: 'Monthly price in USD',
          },
          category: {
            type: 'string',
            enum: ['housing', 'apartment', 'house', 'room', 'studio', 'bike'],
            description: 'Category of the listing',
          },
          location: {
            type: 'string',
            description: 'Area/district (e.g., "An Thuong", "My Khe")',
          },
        },
        required: ['title', 'price'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_event',
      description: 'Create a new event in Da Nang. Use when user wants to organize a meetup, party, or activity.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Event title',
          },
          description: {
            type: 'string',
            description: 'Event description',
          },
          category: {
            type: 'string',
            enum: ['social', 'sports', 'business', 'culture', 'party', 'other'],
            description: 'Event category',
          },
          starts_at: {
            type: 'string',
            description: 'Event start date/time (ISO format)',
          },
          location: {
            type: 'string',
            description: 'Event location',
          },
        },
        required: ['title', 'starts_at'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'rsvp_event',
      description: 'RSVP to an event (going, interested, not going). Use when user wants to attend or show interest in an event.',
      parameters: {
        type: 'object',
        properties: {
          event_id: {
            type: 'string',
            description: 'ID of the event to RSVP to',
          },
          status: {
            type: 'string',
            enum: ['going', 'interested', 'not_going'],
            description: 'RSVP status (default: going)',
          },
        },
        required: ['event_id'],
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
  | 'get_community_posts'
  | 'create_listing'
  | 'create_event'
  | 'rsvp_event';
