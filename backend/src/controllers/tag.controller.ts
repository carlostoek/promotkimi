import { Request, Response } from 'express';
import * as tagService from '../services/tag.service';

export async function getTags(req: Request, res: Response) {
  try {
    const tags = await tagService.getAllTags();

    return res.json({
      success: true,
      data: tags,
      count: tags.length
    });

  } catch (error) {
    console.error('Error obteniendo tags:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}

export async function getTagSuggestions(req: Request, res: Response) {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.length < 1) {
      return res.json({
        success: true,
        data: [],
        message: 'Query vacía'
      });
    }

    const tags = await tagService.getTagSuggestions(query, limit);

    return res.json({
      success: true,
      data: tags,
      count: tags.length
    });

  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}
