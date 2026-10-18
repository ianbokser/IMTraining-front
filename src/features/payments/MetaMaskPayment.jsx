// UI de pago con MetaMask (y cualquier wallet EVM via window.ethereum).
// Flujo:
//   1. Pide al usuario conectar la wallet.
//   2. Si no está en la chain correcta (walletResult.chainId), le ofrece cambiar.
//   3. Firma un ERC20.transfer(to, amount) con el token definido por el backend.
//   4. Manda { orderId, chainId, txHash } a /api/payments/confirm/metamask.
//   5. Cuando el backend aprueba, llama onConfirmed(order).
import { useEffect, useState } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import { Loader2, Wallet, ExternalLink, AlertCircle, Check } from 'lucide-react'
import Button from '../../components/Button'
import { api } from '../../lib/api'

const ERC20_TRANSFER_ABI = ['function transfer(address to, uint256 amount) returns (bool)']

function toHex(n) {
  return '0x' + Number(n).toString(16)
}

export default function MetaMaskPayment({ walletResult, onConfirmed, onError }) {
  const { chainId, chainName, to, token, amount, amountDisplay, orderId, explorer } = walletResult
  const [stage, setStage] = useState('idle')
  // idle → connecting → switching → signing → waiting-confirm → confirming-backend → done | error
  const [txHash, setTxHash] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [hasProvider, setHasProvider] = useState(true)

  useEffect(() => {
    setHasProvider(typeof window !== 'undefined' && Boolean(window.ethereum))
  }, [])

  const fail = (msg) => {
    setErrMsg(msg)
    setStage('error')
    onError?.(msg)
  }

  const ensureChain = async (provider) => {
    const net = await provider.getNetwork()
    if (Number(net.chainId) === Number(chainId)) return
    setStage('switching')
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(chainId) }],
      })
    } catch (e) {
      // 4902 = chain no agregada en MetaMask: fuera del scope agregarla automáticamente.
      if (e?.code === 4902) {
        throw new Error(`La red ${chainName} no está agregada en tu wallet. Agregala y volvé a intentar.`)
      }
      if (e?.code === 4001) throw new Error('Cambio de red cancelado.')
      throw new Error(e?.message || `No pude cambiar a ${chainName}`)
    }
  }

  const handlePay = async () => {
    if (!window.ethereum) {
      fail('Instalá MetaMask (u otra wallet EVM) para pagar en cripto.')
      return
    }
    setErrMsg('')
    try {
      setStage('connecting')
      const provider = new BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])

      await ensureChain(provider)

      setStage('signing')
      const signer = await provider.getSigner()
      const erc20 = new Contract(token.address, ERC20_TRANSFER_ABI, signer)
      const tx = await erc20.transfer(to, amount)
      setTxHash(tx.hash)

      setStage('waiting-confirm')
      await tx.wait(1)

      setStage('confirming-backend')
      const resp = await api.confirmPayment('metamask', {
        orderId,
        chainId,
        txHash: tx.hash,
      })

      setStage('done')
      onConfirmed?.(resp.order)
    } catch (e) {
      if (e?.code === 4001) fail('Pago cancelado en la wallet.')
      else if (e?.code === 'INSUFFICIENT_FUNDS') fail('Saldo insuficiente para cubrir fees.')
      else fail(e?.shortMessage || e?.message || 'No se pudo completar el pago.')
    }
  }

  if (!hasProvider) {
    return (
      <div className="mt-5 rounded-2xl border border-line bg-ink-2 p-5 text-sm">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="font-semibold text-white">No detectamos una wallet</p>
            <p className="mt-1 text-muted">
              Instalá <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className="text-volt underline">MetaMask</a> (u otra wallet EVM) y volvé a cargar la página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const busy = ['connecting', 'switching', 'signing', 'waiting-confirm', 'confirming-backend'].includes(stage)
  const stageLabel = {
    connecting: 'Conectando wallet…',
    switching: `Cambiando a ${chainName}…`,
    signing: 'Confirmá la transacción en tu wallet',
    'waiting-confirm': 'Esperando confirmación on-chain…',
    'confirming-backend': 'Validando pago…',
  }[stage]

  return (
    <div className="mt-5 rounded-2xl border border-line bg-ink-2 p-5">
      <div className="flex items-center gap-2">
        <Wallet size={18} className="text-volt" />
        <h3 className="font-display text-base font-bold text-white">Pago con MetaMask</h3>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <Row k="Red" v={chainName} />
        <Row k="Token" v={token.symbol} />
        <Row k="Monto" v={`${amountDisplay} ${token.symbol}`} />
        <Row k="A la wallet" v={<code className="text-xs text-muted">{to.slice(0, 6)}…{to.slice(-4)}</code>} />
      </dl>

      {stage === 'done' ? (
        <div className="mt-5 rounded-xl border border-ok/40 bg-ok/10 p-3 text-sm text-ok">
          <div className="flex items-center gap-2">
            <Check size={16} /> Pago confirmado on-chain.
          </div>
          {txHash && explorer && (
            <a
              href={`${explorer}${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs underline"
            >
              Ver transacción <ExternalLink size={12} />
            </a>
          )}
        </div>
      ) : (
        <Button className="mt-5 w-full" size="lg" onClick={handlePay} disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {stageLabel}
            </>
          ) : (
            <>
              <Wallet size={18} /> Pagar {amountDisplay} {token.symbol}
            </>
          )}
        </Button>
      )}

      {txHash && stage !== 'done' && explorer && (
        <a
          href={`${explorer}${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-muted underline"
        >
          Ver en explorer <ExternalLink size={12} />
        </a>
      )}

      {errMsg && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium text-white">{v}</dd>
    </div>
  )
}
