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

import { Badge } from '@/components/ui/badge';
import type { StoreNavLink } from '@/types';

import { reorderStoreNavLinksAction } from '../store-settings-actions';
import NavLinkRowActions from './NavLinkRowActions';

function SortableNavLinkRow({
  link,
  dragDisabled,
  onEdit,
}: {
  link: StoreNavLink;
  dragDisabled: boolean;
  onEdit: (link: StoreNavLink) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id, disabled: dragDisabled });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`border-t border-border/40 hover:bg-muted/20 ${
        isDragging ? 'z-10 bg-muted/40 opacity-90' : ''
      }`}
    >
      <td className="px-2 py-3 w-10">
        <button
          type="button"
          className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
          disabled={dragDisabled}
          aria-label={`Arrastrar ${link.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground">{link.label}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {link.categories?.name ?? link.fallback_slug ?? '—'}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-xs">
          {link.is_active ? 'Visible' : 'Oculto'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <NavLinkRowActions link={link} onEdit={onEdit} />
      </td>
    </tr>
  );
}

export default function NavLinksSortableList({
  links,
  dragEnabled,
  onEdit,
}: {
  links: StoreNavLink[];
  dragEnabled: boolean;
  onEdit: (link: StoreNavLink) => void;
}) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(links);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOrdered(links);
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!dragEnabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((l) => l.id === active.id);
    const newIndex = ordered.findIndex((l) => l.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);

    startTransition(async () => {
      try {
        await reorderStoreNavLinksAction(next.map((l) => l.id));
        router.refresh();
        toast.success('Orden del menú actualizado.');
      } catch (err) {
        setOrdered(links);
        toast.error(
          err instanceof Error ? err.message : 'No se pudo reordenar.'
        );
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground font-body">
              <th className="px-2 py-2 w-10" />
              <th className="px-4 py-2">Texto</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <SortableContext
            items={ordered.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {ordered.map((link) => (
                <SortableNavLinkRow
                  key={link.id}
                  link={link}
                  dragDisabled={!dragEnabled}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  );
}
