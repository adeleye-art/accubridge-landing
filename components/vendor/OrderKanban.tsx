'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { KanbanOrderCard } from './KanbanOrderCard'
import type { VendorOrder } from '@/types'

type KanbanCol = 'accepted' | 'preparing' | 'ready'

interface ColumnDef {
  key: KanbanCol
  label: string
  borderColor: string
}

const COLUMNS: ColumnDef[] = [
  { key: 'accepted',  label: 'Accepted',        borderColor: 'border-l-blue-400' },
  { key: 'preparing', label: 'Preparing',        borderColor: 'border-l-amber-400' },
  { key: 'ready',     label: 'Ready for Pickup', borderColor: 'border-l-green-500' },
]

interface OrderKanbanProps {
  initialOrders: VendorOrder[]
}

export function OrderKanban({ initialOrders }: OrderKanbanProps) {
  const [orders, setOrders] = useState<VendorOrder[]>(initialOrders)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function getColOrders(col: KanbanCol) {
    const statusMap: Record<KanbanCol, VendorOrder['status'][]> = {
      accepted:  ['accepted'],
      preparing: ['preparing'],
      ready:     ['picked_up'],
    }
    return orders.filter((o) => statusMap[col].includes(o.status))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedOrder = orders.find((o) => o.id === active.id)
    if (!draggedOrder) return

    // Determine target column from the overId (could be a card id or column id)
    const targetColKey = (COLUMNS.find((c) => c.key === over.id)?.key) as KanbanCol | undefined
    if (!targetColKey) return

    const newStatusMap: Record<KanbanCol, VendorOrder['status']> = {
      accepted:  'accepted',
      preparing: 'preparing',
      ready:     'picked_up',
    }

    setOrders((prev) =>
      prev.map((o) => o.id === draggedOrder.id ? { ...o, status: newStatusMap[targetColKey] } : o)
    )

    if (targetColKey === 'ready') {
      toast.success(`${draggedOrder.order_number} marked ready for pickup`)
    }
  }

  async function handleMarkReady(order: VendorOrder) {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'picked_up' } : o))
    toast.success(`${order.order_number} marked ready`)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-3">
        {COLUMNS.map((col) => {
          const colOrders = getColOrders(col.key)
          return (
            <div key={col.key} id={col.key}>
              {/* Column header */}
              <div className={`border-l-4 ${col.borderColor} pl-3 mb-3`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-primary">{col.label}</span>
                  <span className="text-xs bg-surface-dark text-text-secondary rounded-full px-1.5 py-0.5">
                    {colOrders.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="bg-[#F7F5F0] rounded-lg min-h-32 p-2">
                <SortableContext
                  items={colOrders.map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colOrders.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-4">No orders</p>
                  ) : (
                    colOrders.map((order) => (
                      <KanbanOrderCard
                        key={order.id}
                        order={order}
                        column={col.key}
                        onMarkReady={col.key === 'preparing' ? handleMarkReady : undefined}
                      />
                    ))
                  )}
                </SortableContext>
              </div>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}
