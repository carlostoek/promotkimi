import { Prisma, Category, AnalysisStatus } from '@prisma/client';
import prisma from '../config/database';
import { CreatePromptInput, UpdatePromptInput, PromptFilters } from '../types';

// ==================== CRUD OPERATIONS ====================

export async function createPrompt(data: CreatePromptInput) {
  const { content, analyzeWithAI = true } = data;

  return prisma.prompt.create({
    data: {
      content,
      analysisStatus: analyzeWithAI ? AnalysisStatus.PENDING : AnalysisStatus.COMPLETED,
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

export async function getPromptById(id: string) {
  return prisma.prompt.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

export async function updatePrompt(id: string, data: UpdatePromptInput) {
  const { tags, ...promptData } = data;

  // Si se actualizan tags, manejar la relación
  if (tags !== undefined) {
    // Eliminar tags existentes
    await prisma.promptTag.deleteMany({
      where: { promptId: id }
    });

    // Crear o conectar nuevos tags
    const tagOperations = tags.map(tagName => {
      const normalizedName = normalizeTag(tagName);
      return prisma.tag.upsert({
        where: { normalizedName },
        create: {
          name: tagName,
          normalizedName,
          usageCount: 1
        },
        update: {
          usageCount: {
            increment: 1
          }
        }
      });
    });

    const createdTags = await Promise.all(tagOperations);

    // Actualizar prompt y conectar tags
    return prisma.prompt.update({
      where: { id },
      data: {
        ...promptData,
        tags: {
          create: createdTags.map(tag => ({
            tagId: tag.id
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  // Actualizar sin tags
  return prisma.prompt.update({
    where: { id },
    data: promptData,
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

export async function deletePrompt(id: string) {
  return prisma.prompt.delete({
    where: { id }
  });
}

// ==================== LIST WITH FILTERS ====================

export async function getPrompts(filters: PromptFilters = {}) {
  const {
    search,
    category,
    tags,
    isFavorite,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const where: Prisma.PromptWhereInput = {};

  // Búsqueda por texto
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Filtro por categoría
  if (category) {
    where.category = category;
  }

  // Filtro por favoritos
  if (isFavorite !== undefined) {
    where.isFavorite = isFavorite;
  }

  // Filtro por tags
  if (tags && tags.length > 0) {
    const normalizedTags = tags.map(normalizeTag);
    where.tags = {
      some: {
        tag: {
          normalizedName: {
            in: normalizedTags
          }
        }
      }
    };
  }

  // Ordenamiento
  const orderBy: Prisma.PromptOrderByWithRelationInput = {};
  orderBy[sortBy] = sortOrder;

  return prisma.prompt.findMany({
    where,
    orderBy,
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

// ==================== FAVORITES ====================

export async function toggleFavorite(id: string) {
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { isFavorite: true }
  });

  if (!prompt) {
    throw new Error('Prompt no encontrado');
  }

  return prisma.prompt.update({
    where: { id },
    data: { isFavorite: !prompt.isFavorite },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

// ==================== ANALYSIS ====================

export async function updatePromptAnalysis(
  id: string,
  analysisData: {
    title?: string;
    description?: string;
    category?: Category;
    subcategory?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    analysisResult?: Record<string, any>;
  }
) {
  const { tags, ...data } = analysisData;

  // Eliminar tags existentes
  await prisma.promptTag.deleteMany({
    where: { promptId: id }
  });

  // Crear o conectar nuevos tags
  if (tags && tags.length > 0) {
    const tagOperations = tags.map(tagName => {
      const normalizedName = normalizeTag(tagName);
      return prisma.tag.upsert({
        where: { normalizedName },
        create: {
          name: tagName,
          normalizedName,
          usageCount: 1
        },
        update: {
          usageCount: {
            increment: 1
          }
        }
      });
    });

    const createdTags = await Promise.all(tagOperations);

    return prisma.prompt.update({
      where: { id },
      data: {
        ...data,
        analysisStatus: AnalysisStatus.COMPLETED,
        tags: {
          create: createdTags.map(tag => ({
            tagId: tag.id
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  return prisma.prompt.update({
    where: { id },
    data: {
      ...data,
      analysisStatus: AnalysisStatus.COMPLETED
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

export async function markAnalysisFailed(id: string, errorMessage: string) {
  return prisma.prompt.update({
    where: { id },
    data: {
      analysisStatus: AnalysisStatus.FAILED,
      analysisResult: { error: errorMessage }
    }
  });
}

// ==================== IMAGES ====================

export async function updatePromptImages(
  id: string,
  imageUrl: string | null,
  thumbnailUrl: string | null
) {
  return prisma.prompt.update({
    where: { id },
    data: {
      imageUrl,
      thumbnailUrl
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
}

// ==================== UTILS ====================

function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
