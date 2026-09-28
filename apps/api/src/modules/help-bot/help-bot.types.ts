export type HelpIntent =
  | 'NAVIGATION_GUIDE'
  | 'POLICY_EXPLANATION'
  | 'FEATURE_HOWTO'
  | 'LIVE_DATA_LOOKUP'
  | 'MUTATION_BLOCKED'
  | 'GENERAL_ASSISTANCE';

export interface UserQueryRequest {
  query: string;
  contextPath?: string;
  language?: string;
}

export interface SuggestedAction {
  label: string;
  path?: string;
  query?: string;
  type: 'navigate' | 'query' | 'external';
}

export interface BotResponsePayload {
  answer: string;
  intent: HelpIntent;
  confidence: number;
  suggestedActions: SuggestedAction[];
  readOnlySourcesUsed?: string[];
  timestamp: string;
}

export interface RAGArticle {
  id: string;
  title: string;
  keywords: string[];
  module: string;
  content: string;
  navigationPath?: string;
  rolesAllowed?: string[];
}
