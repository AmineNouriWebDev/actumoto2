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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTableBodyProps<T extends { id: string }> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  tableHeader?: React.ReactNode;
}

export function SortableTableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "rgba(255,255,255,0.05)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ width: "40px", textAlign: "center", cursor: "grab" }} {...attributes} {...listeners}>
        <div style={{ display: "inline-flex", padding: "0.4rem", background: "rgba(255,255,255,0.1)", borderRadius: "0.25rem", color: "white" }} title="Glisser pour réorganiser">
          ☰
        </div>
      </td>
      {children}
    </tr>
  );
}

export default function SortableTableBody<T extends { id: string }>(props: SortableTableBodyProps<T>) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return <SortableTableBodyInner {...props} />;
}

function SortableTableBodyInner<T extends { id: string }>({ items, onReorder, renderItem, tableHeader }: SortableTableBodyProps<T>) {
  const [activeItems, setActiveItems] = useState(items);

  useEffect(() => {
    setActiveItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
      <table className="admin-table">
        {tableHeader}
        <SortableContext items={activeItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <tbody>
            {activeItems.map((item) => (
              <SortableTableRow key={item.id} id={item.id}>
                {renderItem(item)}
              </SortableTableRow>
            ))}
          </tbody>
        </SortableContext>
      </table>
    </DndContext>
  );
}
