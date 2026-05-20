import { useEffect, useId, useRef, useState } from 'react'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

type ItemImageUploadProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  currentImageUrl?: string | null
  disabled?: boolean
  required?: boolean
}

export function ItemImageUpload({
  file,
  onFileChange,
  currentImageUrl,
  disabled = false,
  required = false,
}: ItemImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const displayUrl = previewUrl ?? currentImageUrl ?? null

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled}
        required={required && !currentImageUrl}
        onChange={(e) => {
          const selected = e.target.files?.[0] ?? null
          onFileChange(selected)
        }}
      />

      {displayUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img
            src={displayUrl}
            alt="Pré-visualização do produto"
            className="mx-auto max-h-48 w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Nenhuma imagem selecionada
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-60"
        >
          {displayUrl ? 'Trocar imagem' : 'Escolher imagem'}
        </button>
        {file && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onFileChange(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Remover seleção
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500">
        JPEG, PNG, WebP ou GIF — até 5 MB. A imagem é enviada ao Cloudinary e a URL
        pública é repassada ao Mercado Livre.
      </p>
    </div>
  )
}
