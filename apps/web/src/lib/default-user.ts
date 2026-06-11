import { prisma } from './prisma';

const DEFAULT_USER_EMAIL = 'worker@example.com';
const DEFAULT_USER_NAME = '現場作業員';

/**
 * v1 has no authentication, so API routes that need a user (attendance,
 * project creation) resolve one here: an explicitly passed userId wins,
 * otherwise the shared "default field worker" account is found or created.
 */
export async function resolveUserId(userId?: string | null): Promise<string> {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user.id;
  }

  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME,
    },
  });
  return created.id;
}
