// Registry simétrico al del backend (lib/payments/index.js).
// Mapea providerId → componente React que renderiza la UI del proveedor cuando
// el backend devuelve un `type` que no se puede manejar con un simple redirect
// (ej. 'wallet' para pagos cripto que requieren firmar con la wallet del usuario).
//
// Para sumar un medio de pago con UI custom:
//   1. Crear <nombre>Payment.jsx en esta carpeta.
//   2. Agregar la entrada { [providerId]: Componente } acá.
//   3. El componente recibe { walletResult, onConfirmed, onError } y se encarga del resto.
//
// Los proveedores con type 'redirect' o 'done' no necesitan entrada acá — Checkout.jsx
// los maneja genéricamente.
import MetaMaskPayment from './MetaMaskPayment.jsx'

export const PAYMENT_UI = {
  metamask: MetaMaskPayment,
}
