import prisma from '../config/database';

// ==================== CRUD OPERATIONS ====================

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: [
      { usageCount: 'desc' },
      { name: 'asc' }
    ]
  });
}

export async function getTagSuggestions(query: string, limit = 10) {
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, '-');
  
  return prisma.tag.findMany({
    where: {
      OR: [
        { normalizedName: { contains: normalizedQuery } },
        { name: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: [
      { usageCount: 'desc' },
      { name: 'asc' }
    ],
    take: limit
  });
}

export async function getOrCreateTag(name: string) {
  const normalizedName = normalizeTag(name);
  
  return prisma.tag.upsert({
    where: { normalizedName },
    create: {
      name,
      normalizedName,
      usageCount: 1
    },
    update: {
      usageCount: {
        increment: 1
      }
    }
  });
}

export async function createTags(names: string[]) {
  const operations = names.map(name => getOrCreateTag(name));
  return Promise.all(operations);
}

export async function deleteUnusedTags() {
  return prisma.tag.deleteMany({
    where: {
      usageCount: 0
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
