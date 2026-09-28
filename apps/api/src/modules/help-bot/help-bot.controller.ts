import { Router, Request, Response } from 'express';
import { helpBotService } from './help-bot.service.js';

export const helpBotRouter = Router();

/**
 * POST /api/v1/help-bot/query
 * Process user question & return AI help desk response.
 */
helpBotRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { query, language, contextPath } = req.body || {};

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_INVALID_QUERY',
          message: 'Query text is required'
        }
      });
    }

    const response = await helpBotService.processQuery(req, query, language || 'en', contextPath);
    return res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('HelpBot Query Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ERR_HELP_BOT',
        message: 'An error occurred while processing your help desk query'
      }
    });
  }
});

/**
 * GET /api/v1/help-bot/suggestions
 * Returns route-contextual quick prompt chips.
 */
helpBotRouter.get('/suggestions', (req: Request, res: Response) => {
  const contextPath = req.query.path as string | undefined;
  const suggestions = helpBotService.getContextualSuggestions(contextPath);

  return res.json({
    success: true,
    data: {
      suggestions
    }
  });
});
