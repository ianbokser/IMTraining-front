import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Video, Upload, X, Dumbbell } from 'lucide-react'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import { Input, Textarea } from '../../components/Field'
import { api } from '../../lib/api'

const EMPTY = {
  nombre: '',
  explicacion: '',
  grupoMuscular: '',
  equipamiento: '',
  videoProvider: 'bunny',
  videoId: '',
  videoUrl: '',
  videoThumbnailUrl: '',
  videoEmbedUrl: '',
}

// Biblioteca de ejercicios reutilizables (con video de Bunny). Se usa como pestaña del panel.
export default function Ejercicios() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | exercise

  const load = () => {
    setLoading(true)
    api
      .adminListExercises()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (ex) => {
    if (!confirm(`¿Eliminar "${ex.nombre}"?`)) return
    try {
      await api.adminDeleteExercise(ex.id)
      setItems((prev) => prev.filter((i) => i.id !== ex.id))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="kicker text-muted">Biblioteca</p>
          <h2 className="mt-1 font-display text-xl font-extrabold uppercase text-white">Ejercicios</h2>
        </div>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus size={16} /> Nuevo ejercicio
        </Button>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-ink-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-ink-2 p-10 text-center text-muted">
          Todavía no hay ejercicios. Creá el primero para empezar a armar rutinas.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ex) => (
            <article key={ex.id} className="surface flex flex-col overflow-hidden">
              <div className="aspect-video w-full bg-ink">
                {ex.videoThumbnailUrl ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={ex.videoThumbnailUrl} alt={ex.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-2">
                    {ex.videoEmbedUrl ? <Video size={28} /> : <Dumbbell size={28} />}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display font-bold text-white">{ex.nombre}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ex.grupoMuscular && <Badge tone="muted">{ex.grupoMuscular}</Badge>}
                  {ex.equipamiento && <Badge tone="muted">{ex.equipamiento}</Badge>}
                  {ex.videoEmbedUrl && (
                    <Badge tone="volt">
                      <Video size={12} /> video
                    </Badge>
                  )}
                </div>
                {ex.explicacion && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{ex.explicacion}</p>
                )}
                <div className="mt-4 flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(ex)}>
                    <Pencil size={14} /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(ex)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ExerciseForm
          exercise={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null)
            setItems((prev) => {
              const exists = prev.some((i) => i.id === saved.id)
              return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved]
            })
          }}
        />
      )}
    </div>
  )
}

/* ---------- Formulario de alta/edición (modal) ---------- */
function ExerciseForm({ exercise, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY, ...(exercise || {}) })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onPickVideo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const res = await api.adminUploadVideo(file, form.nombre || file.name)
      setForm((f) => ({
        ...f,
        videoProvider: 'bunny',
        videoId: res.videoId,
        videoEmbedUrl: res.embedUrl,
        videoThumbnailUrl: res.thumbnailUrl,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('El ejercicio necesita un nombre.')
    setSaving(true)
    setError('')
    const payload = {
      nombre: form.nombre,
      explicacion: form.explicacion,
      grupoMuscular: form.grupoMuscular,
      equipamiento: form.equipamiento,
      videoProvider: form.videoProvider,
      videoId: form.videoId,
      videoUrl: form.videoUrl,
    }
    try {
      const saved = exercise
        ? await api.adminUpdateExercise(exercise.id, payload)
        : await api.adminCreateExercise(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="my-8 w-full max-w-lg rounded-2xl border border-line bg-ink-2 p-6 shadow-lift"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold uppercase text-white">
            {exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}
          </h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <Input label="Nombre" required value={form.nombre} onChange={set('nombre')} placeholder="Sentadilla sumo" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Grupo muscular" value={form.grupoMuscular} onChange={set('grupoMuscular')} placeholder="Piernas" />
            <Input label="Equipamiento" value={form.equipamiento} onChange={set('equipamiento')} placeholder="Mancuernas" />
          </div>
          <Textarea label="Explicación" value={form.explicacion} onChange={set('explicacion')} placeholder="Cómo ejecutar el ejercicio, técnica, respiración…" />

          {/* Video */}
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-white/85">Video de ejemplo</span>
            <div className="rounded-xl border border-line bg-ink-3 p-4">
              {form.videoEmbedUrl ? (
                <div className="flex items-center gap-3">
                  <div className="aspect-video w-32 overflow-hidden rounded-lg bg-ink">
                    {form.videoThumbnailUrl ? (
                      <img src={form.videoThumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-volt"><Video size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 text-sm text-muted">Video cargado.</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, videoId: '', videoEmbedUrl: '', videoThumbnailUrl: '' }))}
                  >
                    <Trash2 size={14} /> Quitar
                  </Button>
                </div>
              ) : (
                <div>
                  <input ref={fileRef} type="file" accept="video/*" onChange={onPickVideo} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={14} /> {uploading ? 'Subiendo…' : 'Subir video a Bunny'}
                  </Button>
                  <p className="mt-2 text-xs text-muted">
                    O pegá una URL de embed (fallback si no usás Bunny):
                  </p>
                  <Input className="mt-2" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://www.youtube.com/embed/…" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || uploading}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </form>
    </div>
  )
}
