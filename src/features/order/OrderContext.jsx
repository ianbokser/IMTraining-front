import { createContext, useContext, useState } from 'react'

const OrderContext = createContext(null)

const emptyOrder = {
  // datos corporales
  edad: '',
  peso: '',
  altura: '',
  discapacidad: '',
  lesiones: '',
  // preferencias
  diasPorSemana: '3',
  enfoque: 'Fuerza',
  intensidad: 'Intermedio',
  disponibilidad: '45-60 min',
  deportes: '',
  // plan elegido
  plan: 'Rutina Única',
}

export function OrderProvider({ children }) {
  const [order, setOrder] = useState(emptyOrder)
  const [createdOrder, setCreatedOrder] = useState(null)

  const updateOrder = (patch) => setOrder((prev) => ({ ...prev, ...patch }))
  const resetOrder = () => {
    setOrder(emptyOrder)
    setCreatedOrder(null)
  }

  return (
    <OrderContext.Provider
      value={{ order, updateOrder, resetOrder, createdOrder, setCreatedOrder }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder debe usarse dentro de OrderProvider')
  return ctx
}
