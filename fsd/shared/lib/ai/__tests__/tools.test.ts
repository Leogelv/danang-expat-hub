import { describe, it, expect } from 'vitest';
import { AI_TOOLS, type ToolName } from '../tools';

describe('AI Tools definitions', () => {
  it('has 10 tools', () => {
    expect(AI_TOOLS).toHaveLength(10);
  });

  it('each tool has required structure', () => {
    AI_TOOLS.forEach(tool => {
      expect(tool.type).toBe('function');
      expect(tool.function.name).toBeTruthy();
      expect(tool.function.description).toBeTruthy();
      expect(tool.function.parameters.type).toBe('object');
    });
  });

  it('has no duplicate tool names', () => {
    const names = AI_TOOLS.map(t => t.function.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all ToolName values match AI_TOOLS names', () => {
    const toolNames = AI_TOOLS.map(t => t.function.name);
    const expectedNames: ToolName[] = [
      'search_listings', 'search_places', 'search_market', 'search_events',
      'get_user_favorites', 'create_community_post', 'get_community_posts',
      'create_listing', 'create_event', 'rsvp_event'
    ];
    expectedNames.forEach(name => {
      expect(toolNames).toContain(name);
    });
  });
});
