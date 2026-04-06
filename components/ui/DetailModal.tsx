'use client'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export default function DetailModal({
  open,
  onClose,
  title,
  children,
  width = "600px"
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-auto"
        style={{ width }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}