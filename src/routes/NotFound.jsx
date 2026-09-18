import { ArrowLeft, Dumbbell } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="glow pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2" />
      <div className="relative mx-auto max-w-md px-5 py-32 text-center">
        <p className="numeral text-8xl text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-extrabold uppercase text-white">Página no encontrada</h1>
        <p className="mt-2 text-muted">
          La página que buscás no existe o se movió. Volvamos a lo importante: tu entrenamiento.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as="link" to="/">
            <ArrowLeft size={18} /> Volver al inicio
          </Button>
          <Button as="link" to="/pedido" variant="outline">
            <Dumbbell size={18} /> Pedir mi rutina
          </Button>
        </div>
      </div>
    </div>
  )
}
