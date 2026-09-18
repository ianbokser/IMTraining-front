import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { OrderProvider } from './features/order/OrderContext'
import { AuthProvider, RequireAuth, RequireAdmin } from './features/auth/AuthContext'

import Home from './routes/Home'
import EjemploRutina from './routes/EjemploRutina'
import PedidoRutina from './routes/PedidoRutina'
import Checkout from './routes/Checkout'
import Login from './routes/Login'
import Registro from './routes/Registro'
import AdminPanel from './routes/AdminPanel'
import RutinaBuilder from './routes/admin/RutinaBuilder'
import MisRutinas from './routes/MisRutinas'
import NotFound from './routes/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ejemplo" element={<EjemploRutina />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route
              path="/pedido"
              element={
                <RequireAuth>
                  <PedidoRutina />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/mis-rutinas"
              element={
                <RequireAuth>
                  <MisRutinas />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPanel />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/rutinas/nueva"
              element={
                <RequireAdmin>
                  <RutinaBuilder />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </OrderProvider>
    </AuthProvider>
  )
}
