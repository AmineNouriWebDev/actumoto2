"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableGridProps<T extends { id: string }> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  strategy?: any;
}

export function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        {...attributes} 
        {...listeners}
        style={{ 
          position: "absolute", 
          top: "50%", 
          transform: "translateY(-50%)",
          left: "0.5rem", 
          cursor: "grab", 
          zIndex: 20, 
          background: "rgba(0,0,0,0.6)", 
          borderRadius: "0.375rem", 
          width: "36px", 
          height: "36px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "1.25rem", 
          color: "white" 
        }} 
        className="drag-handle"
        title="Glisser pour réorganiser"
      >
        ☰
      </div>
      {children}
    </div>
  );
}

export default function SortableGrid<T extends { id: string }>(props: SortableGridProps<T>) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return <SortableGridInner {...props} />;
}

function SortableGridInner<T extends { id: string }>({ items, onReorder, renderItem, strategy = rectSortingStrategy }: SortableGridProps<T>) {
  const [activeItems, setActiveItems] = useState(items);

  useEffect(() => {
    setActiveItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeItems.findIndex((item) => item.id === active.id);
      const newIndex = activeItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(activeItems, oldIndex, newIndex);
      setActiveItems(newItems);
      onReorder(newItems);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={activeItems.map((item) => item.id)} strategy={strategy}>
        {activeItems.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {renderItem(item)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
