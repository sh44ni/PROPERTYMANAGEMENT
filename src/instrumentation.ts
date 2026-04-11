export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { ensureBootstrapAdmin } = await import('@/lib/server/bootstrapAdmin');
  await ensureBootstrapAdmin().catch((err) => {
    console.error('[bootstrap] ensureBootstrapAdmin failed:', err);
  });
}
