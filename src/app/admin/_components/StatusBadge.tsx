import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      >
        Completado
      </Badge>
    );
  }

  if (status === 'pending') {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 text-amber-300"
      >
        Pendiente
      </Badge>
    );
  }

  if (status === 'cancelled') {
    return (
      <Badge
        variant="outline"
        className="border-zinc-500/50 bg-zinc-500/15 text-zinc-400"
      >
        Cancelado
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-zinc-500/40 bg-zinc-500/10 text-zinc-300">
      {status}
    </Badge>
  );
}
