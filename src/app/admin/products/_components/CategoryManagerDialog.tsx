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
import { GripVertical, LoaderCircle, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types';

import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from '../actions/category_actions';
import { nameToSlug } from '../lib/category-utils';

type CategoryManagerDialogProps = {
  categories: Category[];
};

type SortableCategoryItemProps = {
  category: Category;
  editingId: string | null;
  editName: string;
  editSlug: string;
  isPending: boolean;
  onEditNameChange: (name: string) => void;
  onEditSlugChange: (slug: string) => void;
  onStartEdit: (category: Category) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
};

function SortableCategoryItem({
  category,
  editingId,
  editName,
  editSlug,
  isPending,
  onEditNameChange,
  onEditSlugChange,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditing = editingId === category.id;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center border-b border-border/40 last:border-b-0 ${
        isDragging ? 'z-10 rounded-lg bg-muted/40 opacity-90' : ''
      }`}
    >
      {isEditing ? (
        <>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              disabled={isPending}
              className="py-4"
              aria-label="Nombre"
            />
            <Input
              value={editSlug}
              onChange={(e) => onEditSlugChange(e.target.value)}
              disabled={isPending}
              className="py-4 font-mono text-xs"
              aria-label="Slug"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => onUpdate(category.id)}
            >
              Guardar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={onCancelEdit}
            >
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            className="shrink-0 cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground active:cursor-grabbing"
            aria-label={`Arrastrar ${category.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{category.name}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {category.slug}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => onStartEdit(category)}
              aria-label={`Editar ${category.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => onDelete(category.id)}
              aria-label={`Eliminar ${category.name}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </>
      )}
    </li>
  );
}

export default function CategoryManagerDialog({
  categories,
}: CategoryManagerDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Category[]>(categories);
  const [newName, setNewName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setNewName('');
    setErrorMsg(null);
    setEditingId(null);
    setEditName('');
    setEditSlug('');
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetForm();
      setItems(categories);
    }
  };

  const refreshAfterMutation = () => {
    router.refresh();
    resetForm();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createCategoryAction(newName);
        setNewName('');
        refreshAfterMutation();
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'No se pudo crear la categoría.'
        );
      }
    });
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
  };

  const handleUpdate = (id: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await updateCategoryAction(id, editName, editSlug);
        refreshAfterMutation();
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar la categoría.'
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
        if (editingId === id) cancelEdit();
        setItems((prev) => prev.filter((c) => c.id !== id));
        refreshAfterMutation();
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'No se pudo eliminar la categoría.'
        );
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const previous = items;
    setItems(reordered);
    setErrorMsg(null);

    startTransition(async () => {
      try {
        await reorderCategoriesAction(reordered.map((c) => c.id));
        router.refresh();
      } catch (err) {
        setItems(previous);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'No se pudo reordenar las categorías.'
        );
      }
    });
  };

  const sortableIds = items.map((c) => c.id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="shrink-0 font-bold">
            Gestionar Categorías
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="font-sans">Categorías</DialogTitle>
          <DialogDescription className="font-body">
            Creá, editá, reordená o eliminá categorías. Arrastrá el ícono de
            agarre para cambiar el orden.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la nueva categoría"
            disabled={isPending}
            className="flex-1 py-5"
            aria-label="Nueva categoría"
          />
          <Button type="submit" disabled={isPending || !newName.trim()}>
            {isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Agregar'
            )}
          </Button>
        </form>

        {errorMsg && (
          <p className="text-sm font-body font-bold text-destructive" role="alert">
            {errorMsg}
          </p>
        )}

        <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground font-body">
              No hay categorías. Agregá la primera arriba.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {items.map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      editingId={editingId}
                      editName={editName}
                      editSlug={editSlug}
                      isPending={isPending}
                      onEditNameChange={(name) => {
                        setEditName(name);
                        setEditSlug(nameToSlug(name));
                      }}
                      onEditSlugChange={setEditSlug}
                      onStartEdit={startEdit}
                      onCancelEdit={cancelEdit}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
