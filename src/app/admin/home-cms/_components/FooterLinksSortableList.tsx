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
import type { StoreFooterLink } from '@/types';

import { reorderStoreFooterLinksAction } from '../footer-actions';
import FooterLinkRowActions from './FooterLinkRowActions';

function SortableFooterLinkRow({
  link,
  dragDisabled,
  onEdit,
}: {
  link: StoreFooterLink;
  dragDisabled: boolean;
  onEdit: (link: StoreFooterLink) => void;
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
      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{link.href}</td>
      <td className="px-4 py-3 text-center">
        <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-xs">
          {link.is_active ? 'Visible' : 'Oculto'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <FooterLinkRowActions link={link} onEdit={onEdit} />
      </td>
    </tr>
  );
}

type FooterLinksSortableListProps = {
  links: StoreFooterLink[];
  dragEnabled: boolean;
  onEdit: (link: StoreFooterLink) => void;
};

export default function FooterLinksSortableList({
  links,
  dragEnabled,
  onEdit,
}: FooterLinksSortableListProps) {
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

    const oldIndex = ordered.findIndex((i) => i.id === active.id);
    const newIndex = ordered.findIndex((i) => i.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);

    startTransition(async () => {
      try {
        await reorderStoreFooterLinksAction(next.map((i) => i.id));
        router.refresh();
        toast.success('Orden actualizado.');
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
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <SortableContext
            items={ordered.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {ordered.map((link) => (
                <SortableFooterLinkRow
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
