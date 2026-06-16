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

import { getTopBarIcon } from '@/lib/top-bar-icons';
import { Badge } from '@/components/ui/badge';
import type { StoreTopBarItem } from '@/types';

import { reorderStoreTopBarItemsAction } from '../top-bar-actions';
import TopBarItemRowActions from './TopBarItemRowActions';

function SortableTopBarItemRow({
  item,
  dragDisabled,
  onEdit,
}: {
  item: StoreTopBarItem;
  dragDisabled: boolean;
  onEdit: (item: StoreTopBarItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: dragDisabled });

  const Icon = getTopBarIcon(item.icon);

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
          aria-label={`Arrastrar ${item.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground">{item.label}</td>
      <td className="px-4 py-3 text-center">
        <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs">
          {item.is_active ? 'Visible' : 'Oculto'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <TopBarItemRowActions item={item} onEdit={onEdit} />
      </td>
    </tr>
  );
}

type TopBarItemsSortableListProps = {
  items: StoreTopBarItem[];
  dragEnabled: boolean;
  onEdit: (item: StoreTopBarItem) => void;
};

export default function TopBarItemsSortableList({
  items,
  dragEnabled,
  onEdit,
}: TopBarItemsSortableListProps) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(items);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOrdered(items);
  }, [items]);

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
        await reorderStoreTopBarItemsAction(next.map((i) => i.id));
        router.refresh();
        toast.success('Orden actualizado.');
      } catch (err) {
        setOrdered(items);
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
              <th className="px-4 py-2">Icono</th>
              <th className="px-4 py-2">Texto</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <SortableContext
            items={ordered.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {ordered.map((item) => (
                <SortableTopBarItemRow
                  key={item.id}
                  item={item}
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
