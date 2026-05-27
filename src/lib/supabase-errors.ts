/** Errores de PostgREST/Postgres por tabla o columna inexistente. */
export function isMissingSchemaError(error: {
  code?: string;
  message?: string;
} | null): boolean {
  if (!error) return false;

  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST204' ||
    code === 'PGRST200' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('could not find the') ||
    msg.includes('relation') && msg.includes('does not exist')
  );
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: string }).message;
    if (message) return message;
  }
  return 'Error desconocido';
}
