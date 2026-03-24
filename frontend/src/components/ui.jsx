// src/components/ui.jsx — All shared UI components

export function Badge({ children, variant = 'gray' }) {
  const styles = {
    gray:   'bg-gray-100 text-gray-600',
    blue:   'bg-primary-light text-primary',
    green:  'bg-success-light text-success',
    amber:  'bg-accent-light text-accent',
    red:    'bg-danger-light text-danger',
    orange: 'bg-orange-50 text-orange-700',
  }
  const dots = {
    gray: 'bg-gray-400', blue: 'bg-primary', green: 'bg-success',
    amber: 'bg-accent', red: 'bg-danger', orange: 'bg-orange-500',
  }
  return (
    <span className={`badge ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />
      {children}
    </span>
  )
}

const STATUS_MAP = {
  'Nayi':           'gray',
  'Niyukt':         'blue',
  'Vichaaradheen':  'amber',
  'Nipatara':       'green',
  'Viprit':         'red',
}
const PRIORITY_MAP = {
  'Neem':           'blue',
  'Madhyam':        'gray',
  'Uchcha':         'amber',
  'Atyadhik Uchcha':'red',
}

export const StatusBadge   = ({ s }) => <Badge variant={STATUS_MAP[s]   || 'gray'}>{s}</Badge>
export const PriorityBadge = ({ p }) => <Badge variant={PRIORITY_MAP[p] || 'gray'}>{p}</Badge>

export function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin text-primary">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" strokeLinecap="round" />
    </svg>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )
}

export function EmptyState({ message = 'Koi data nahi mila', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm">{message}</div>
    </div>
  )
}

export function StatCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue:    { bar: 'bg-primary',  val: 'text-primary',  icon: 'bg-primary-light' },
    green:   { bar: 'bg-success',  val: 'text-success',  icon: 'bg-success-light' },
    amber:   { bar: 'bg-accent',   val: 'text-accent',   icon: 'bg-accent-light'  },
    neutral: { bar: 'bg-gray-400', val: 'text-gray-600', icon: 'bg-gray-100'      },
    red:     { bar: 'bg-danger',   val: 'text-danger',   icon: 'bg-danger-light'  },
  }
  const c = colors[color]
  return (
    <div className={`card relative overflow-hidden pt-4`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      <div className={`w-9 h-9 rounded-lg ${c.icon} flex items-center justify-center text-lg mb-3`}>{icon}</div>
      <div className={`text-2xl font-semibold ${c.val}`}>{value}</div>
      <div className="text-xs font-medium text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function Table({ columns, data, onRow }) {
  if (!data?.length) return <EmptyState />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-3.5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRow?.(row)}
              className={`border-b border-gray-50 last:border-0 ${onRow ? 'cursor-pointer hover:bg-primary-light/40' : 'hover:bg-gray-50'} transition-colors`}
            >
              {columns.map(col => (
                <td key={col.key} className="px-3.5 py-2.5 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null
  const { page, pages, total } = pagination
  const start = (page - 1) * (total / pages | 0) + 1
  const end   = Math.min(page * (total / pages | 0), total)

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
      <span className="text-xs text-gray-400">{start}–{end} of {total}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50"
        >←</button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded border text-xs
              ${p === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'}`}
          >{p}</button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50"
        >→</button>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info:    'bg-primary-light text-primary border-l-2 border-primary',
    success: 'bg-success-light text-success border-l-2 border-success',
    warning: 'bg-accent-light text-accent border-l-2 border-accent',
    danger:  'bg-danger-light text-danger border-l-2 border-danger',
  }
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '❌' }
  return (
    <div className={`flex gap-2.5 p-3 rounded-lg text-xs ${styles[type]} mb-4`}>
      <span>{icons[type]}</span>
      <div>{children}</div>
    </div>
  )
}
