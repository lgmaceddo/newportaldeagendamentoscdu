import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

// Custom PointerSensor com atraso para permitir cliques
const DelayedPointerSensor = class extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: PointerEvent }) => {
        // Permite cliques normais em botões e inputs
        if (
          event.isPrimary &&
          event.button === 0 &&
          !isInteractiveElement(event.target as HTMLElement)
        ) {
          return true;
        }
        return false;
      },
    },
  ];
};

// Função auxiliar para verificar se o elemento é interativo (para ignorar o atraso)
function isInteractiveElement(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'button' ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.hasAttribute('role', 'button') ||
    element.hasAttribute('role', 'link') ||
    element.hasAttribute('contenteditable')
  );
}


interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  handleClassName?: string; // Mantido, mas não usado para o handle visual
}

// Componente individual arrastável
export const SortableItem = ({ id, children, className }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative transition-transform duration-300 cursor-grab", // Adiciona cursor-grab ao item inteiro
        isDragging ? "shadow-2xl ring-2 ring-primary/50 scale-[1.02]" : "",
        className
      )}
      // Aplicando listeners e attributes ao elemento principal
      {...listeners}
      {...attributes}
    >
      {/* O conteúdo (botão de categoria) */}
      <div>
        {children}
      </div>
    </div>
  );
};

interface SortableListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onReorder: (oldIndex: number, newIndex: number) => void;
  className?: string;
  itemClassName?: string;
  handleClassName?: string;
}

// Componente principal da lista arrastável
export function SortableList<T extends { id: string }>({
  items,
  renderItem,
  onReorder,
  className,
  itemClassName,
  handleClassName,
}: SortableListProps<T>) {
  
  // Usando o PointerSensor padrão, mas com um atraso para permitir cliques
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Mínimo de 5px de movimento para iniciar o arrasto
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = useMemo(() => items.map(item => item.id), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over?.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-3", className)}>
          {items.map((item) => (
            <SortableItem 
              key={item.id} 
              id={item.id} 
              className={itemClassName}
              // handleClassName não é mais necessário, mas mantemos a prop para evitar quebras
            >
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}