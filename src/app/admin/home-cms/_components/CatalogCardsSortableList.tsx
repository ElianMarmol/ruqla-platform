'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { toast } from 'sonner';

import { getSetupIcon } from '@/lib/setup-icons';
import { Badge } from '@/components/ui/badge';
import type { HomeCatalogCard } from '@/types';

import { reorderHomeCatalogCardsAction } from '../catalog-section-actions';
import CatalogCardRowActions from './CatalogCardRowActions';

type SortableCatalogCardRowProps = {
  card: HomeCatalogCard;
  dragDisabled: boolean;
  onEdit: (card: HomeCatalogCard) => void;
};

function SortableCatalogCardRow({
  card,
  dragDisabled,
  onEdit,
}: SortableCatalogCardRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: dragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getSetupIcon(card.icon);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-border/40 transition-colors hover:bg-muted/20 ${
        isDragging ? 'z-10 bg-muted/40 opacity-90' : ''
      }`}
    >
      <td className="px-2 py-3 w-10">
        <button
          type="button"
          className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Arrastrar ${card.title}`}
          disabled={dragDisabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground">{card.title}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {card.categories?.name ?? card.fallback_slug ?? '—'}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge variant={card.is_active ? 'default' : 'secondary'} className="text-xs">
          {card.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <CatalogCardRowActions card={card} onEdit={onEdit} />
      </td>
    </tr>
  );
}

type CatalogCardsSortableListProps = {
  cards: HomeCatalogCard[];
  dragEnabled: boolean;
  onEdit: (card: HomeCatalogCard) => void;
};

export default function CatalogCardsSortableList({
  cards,
  dragEnabled,
  onEdit,
}: CatalogCardsSortableListProps) {
  const router = useRouter();
  const [items, setItems] = useState(cards);
  const [isReordering, startReorderTransition] = useTransition();

  useEffect(() => {
    setItems(cards);
  }, [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!dragEnabled) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const previous = items;
    setItems(reordered);

    startReorderTransition(async () => {
      try {
        await reorderHomeCatalogCardsAction(reordered.map((c) => c.id));
        router.refresh();
        toast.success('Orden actualizado.');
      } catch (err) {
        setItems(previous);
        toast.error(
          err instanceof Error ? err.message : 'No se pudo reordenar las tarjetas.'
        );
      }
    });
  };

  const sortableIds = items.map((c) => c.id);

  return (
    <div className="overflow-x-auto">
      <p className="px-5 pb-2 text-xs text-muted-foreground font-body">
        Arrastrá el ícono de agarre para cambiar el orden en la portada.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full text-sm font-body">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-2 py-3" aria-label="Orden" />
              <th className="px-4 py-3 text-left font-semibold">Ícono</th>
              <th className="px-4 py-3 text-left font-semibold">Título</th>
              <th className="px-4 py-3 text-left font-semibold">Categoría</th>
              <th className="px-4 py-3 text-center font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <tbody className={isReordering ? 'opacity-70 pointer-events-none' : ''}>
              {items.map((card) => (
                <SortableCatalogCardRow
                  key={card.id}
                  card={card}
                  dragDisabled={!dragEnabled}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
}
