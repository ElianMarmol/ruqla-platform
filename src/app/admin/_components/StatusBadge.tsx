import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/50 bg-emerald-500/15 text-emerald-700"
      >
        Completado
      </Badge>
    );
  }

  if (status === 'pending') {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/50 bg-amber-500/15 text-amber-800"
      >
        Pendiente
      </Badge>
    );
  }

  if (status === 'cancelled') {
    return (
      <Badge
        variant="outline"
        className="border-zinc-400/50 bg-zinc-500/10 text-zinc-600"
      >
        Cancelado
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
      {status}
    </Badge>
  );
}
