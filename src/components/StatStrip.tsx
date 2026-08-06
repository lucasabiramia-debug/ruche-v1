import { useNavigate } from 'react-router-dom'

export interface StatItem {
  label: string
  value: string | number
  to: string
}

// Compact secondary stats row — informative without stealing focus.
export function StatStrip({ items, isLoading }: { items: StatItem[]; isLoading?: boolean }) {
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="h-16 animate-pulse rounded-xl bg-gray-100"></div>
  }

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.to)}
          className="bg-white p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <p className="text-xl font-bold text-gray-900">{item.value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
        </button>
      ))}
    </div>
  )
}
