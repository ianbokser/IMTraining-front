import { useEffect, useMemo, useState } from 'react'
import {
  LogOut,
  FileDown,
  Users,
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Dumbbell,
  Wand2,
} from 'lucide-react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { useAuth } from '../features/auth/AuthContext'
import { api } from '../lib/api'
import Ejercicios from './admin/Ejercicios'

const fmtField = (k) =>
  ({
    edad: 'Edad',
    peso: 'Peso (kg)',
    altura: 'Altura (cm)',
    diasPorSemana: 'Días/semana',
    enfoque: 'Enfoque',
    intensidad: 'Experiencia',
    disponibilidad: 'Disponibilidad',
    deportes: 'Deportes',
    lesiones: 'Lesiones',
    discapacidad: 'Discapacidad',
  })[k] || k

export default function AdminPanel() {
  const { auth, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('personas')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getUsers(), api.getOrders()])
      .then(([u, o]) => {
        setUsers(u)
        setOrders(o)
      })
      .catch((e) => setError(e.message || 'No se pudieron cargar los datos'))
      .finally(() => setLoading(false))
  }, [])

  // Pedidos agrupados por usuario (para el detalle de cada persona).
  const ordersByUser = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const key = o.userId || `anon:${o.email}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(o)
    }
    return map
  }, [orders])

  const stats = {
    personas: users.length,
    pedidos: orders.length,
    pagados: orders.filter((o) => o.estado === 'pagado').length,
    pendientes: orders.filter((o) => o.estado === 'pendiente').length,
  }

  const q = query.trim().toLowerCase()
  const filteredUsers = q
    ? users.filter((u) => `${u.nombre} ${u.email} ${u.telefono}`.toLowerCase().includes(q))
    : users
  const filteredOrders = q
    ? orders.filter((o) => `${o.cliente} ${o.plan} ${o.estado}`.toLowerCase().includes(q))
    : orders

  const selectedUser = users.find((u) => u.id === selectedUserId) || null
  const selectedUserOrders = selectedUser ? ordersByUser.get(selectedUser.id) || [] : []

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="kicker text-volt-deep">
            <span className="mr-2">—</span> Panel interno
          </p>
          <h1 className="mt-3 text-3xl font-extrabold uppercase text-white">Administración</h1>
          <p className="mt-1 text-muted">Hola, {auth?.nombre || 'Admin'}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut size={16} /> Cerrar sesión
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Personas" value={stats.personas} icon={Users} />
        <Stat label="Pedidos" value={stats.pedidos} icon={ClipboardList} />
        <Stat label="Pagados" value={stats.pagados} icon={CheckCircle2} tone="ok" />
        <Stat label="Pendientes" value={stats.pendientes} icon={Clock} tone="warn" />
      </div>

      {/* Tabs + búsqueda */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-line bg-ink-2 p-1">
          <TabButton active={tab === 'personas'} onClick={() => setTab('personas')} icon={Users}>
            Personas
          </TabButton>
          <TabButton active={tab === 'pedidos'} onClick={() => setTab('pedidos')} icon={ClipboardList}>
            Pedidos
          </TabButton>
          <TabButton active={tab === 'ejercicios'} onClick={() => setTab('ejercicios')} icon={Dumbbell}>
            Ejercicios
          </TabButton>
        </div>
        <div className="relative sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-xl border border-line bg-ink-3 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-muted-2 focus:border-volt focus:outline-none focus:ring-4 focus:ring-volt/15"
          />
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-2" />
          ))}
        </div>
      ) : tab === 'ejercicios' ? (
        <Ejercicios />
      ) : tab === 'personas' ? (
        <PersonasView
          users={filteredUsers}
          ordersByUser={ordersByUser}
          selectedUser={selectedUser}
          selectedUserOrders={selectedUserOrders}
          onSelect={(u) => setSelectedUserId(u.id)}
        />
      ) : (
        <PedidosView orders={filteredOrders} selected={selectedOrder} onSelect={setSelectedOrder} />
      )}
    </div>
  )
}

/* ---------- Vista: Personas ---------- */
function PersonasView({ users, ordersByUser, selectedUser, selectedUserOrders, onSelect }) {
  if (users.length === 0) {
    return <EmptyState>No hay personas que coincidan.</EmptyState>
  }
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        {users.map((u) => {
          const count = (ordersByUser.get(u.id) || []).length
          const active = selectedUser?.id === u.id
          return (
            <button
              key={u.id}
              onClick={() => onSelect(u)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                active ? 'border-volt bg-volt/5' : 'border-line bg-ink-2 hover:border-line-strong'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-display font-bold text-white">
                  {u.nombre}
                  {u.isAdmin && (
                    <Badge tone="volt">
                      <ShieldCheck size={12} /> Admin
                    </Badge>
                  )}
                </span>
                <Badge tone="muted">
                  {count} {count === 1 ? 'pedido' : 'pedidos'}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {u.email}
                </span>
                {u.telefono && (
                  <>
                    <span className="text-line">·</span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} /> {u.telefono}
                    </span>
                  </>
                )}
                <span className="text-line">·</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> {u.fecha}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="lg:col-span-2">
        {selectedUser ? (
          <div className="sticky top-24 space-y-4">
            <div className="surface p-6">
              <h3 className="font-display text-lg font-bold text-white">{selectedUser.nombre}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail size={13} /> {selectedUser.email}
              </p>
              {selectedUser.telefono && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Phone size={13} /> {selectedUser.telefono}
                </p>
              )}
              <p className="mt-2 text-xs text-muted">Alta: {selectedUser.fecha}</p>
            </div>
            <p className="kicker text-muted">Pedidos de esta persona</p>
            {selectedUserOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-ink-2 p-6 text-center text-sm text-muted">
                Sin pedidos todavía.
              </div>
            ) : (
              selectedUserOrders.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        ) : (
          <EmptyState>Seleccioná una persona para ver su detalle y pedidos.</EmptyState>
        )}
      </div>
    </div>
  )
}

/* ---------- Vista: Pedidos ---------- */
function PedidosView({ orders, selected, onSelect }) {
  if (orders.length === 0) {
    return <EmptyState>No hay pedidos que coincidan.</EmptyState>
  }
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        {orders.map((o) => {
          const active = selected?.id === o.id
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                active ? 'border-volt bg-volt/5' : 'border-line bg-ink-2 hover:border-line-strong'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-white">{o.cliente}</span>
                <Badge tone={o.estado === 'pagado' ? 'ok' : 'warn'}>{o.estado}</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-sm text-muted">
                <span>{o.plan}</span>
                <span className="text-line">·</span>
                <span>{o.fecha}</span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="lg:col-span-2">
        {selected ? (
          <div className="sticky top-24">
            <OrderCard order={selected} expanded />
          </div>
        ) : (
          <EmptyState>Seleccioná un pedido para ver el detalle.</EmptyState>
        )}
      </div>
    </div>
  )
}

/* ---------- Tarjeta de pedido reutilizable ---------- */
function OrderCard({ order, expanded = false }) {
  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-display font-bold text-white">{order.plan}</h4>
          <p className="text-xs text-muted">{order.fecha}</p>
        </div>
        <Badge tone={order.estado === 'pagado' ? 'ok' : 'warn'}>{order.estado}</Badge>
      </div>
      <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        {Object.entries(order.datos).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className="text-muted">{fmtField(k)}</span>
            <span className="text-right font-medium text-white">{String(v || '—')}</span>
          </div>
        ))}
      </div>
      {expanded && (
        <div className="mt-6 space-y-3">
          {order.estado === 'pagado' && (
            <Button as="link" to={`/admin/rutinas/nueva?orderId=${order.id}`} className="w-full">
              <Wand2 size={18} /> {order.routineId ? 'Editar rutina' : 'Crear rutina'}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            disabled={order.estado !== 'pagado'}
            onClick={() => {
              const url = api.orderPdfUrl(order.id)
              if (url) window.open(url, '_blank')
            }}
          >
            <FileDown size={18} />{' '}
            {order.estado === 'pagado' ? 'Descargar PDF' : 'PDF disponible al pagar'}
          </Button>
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? 'bg-volt text-ink' : 'text-white/60 hover:text-white'
      }`}
    >
      <Icon size={16} /> {children}
    </button>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-ink-2 p-8 text-center text-muted">
      {children}
    </div>
  )
}

function Stat({ label, value, icon: Icon, tone = 'volt' }) {
  const colors = {
    volt: 'text-volt bg-volt/10',
    ok: 'text-ok bg-ok/10',
    warn: 'text-warn bg-warn/10',
  }
  return (
    <div className="surface flex items-center justify-between p-6">
      <div>
        <p className="kicker text-muted">{label}</p>
        <p className="numeral mt-2 text-4xl text-white">{value}</p>
      </div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${colors[tone]}`}>
        <Icon size={22} />
      </span>
    </div>
  )
}
