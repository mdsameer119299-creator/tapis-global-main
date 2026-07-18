import Link from 'next/link'

type Column<T> = {
  key: string
  header: string
  render: (row: T) => React.ReactNode
}

type Props<T> = {
  caption: string
  columns: Column<T>[]
  rows: T[]
  /** Omit when rows have no detail page to navigate to (e.g. the
   * Customers list, which has no per-customer route in v1) — the first
   * column then renders as plain text instead of a fake link to nowhere. */
  getRowHref?: (row: T) => string
  getRowKey: (row: T) => string
  emptyMessage: string
}

/** Thin semantic wrapper enforcing real <table> markup in one place — real
 * <th scope="col">, a <caption> (visually hidden since the page's own <h1>
 * already names the table), and a keyboard-reachable link on the first
 * column rather than a bare onClick on <tr> (not a valid interactive
 * target for keyboard/screen-reader users). */
export default function AdminDataTable<T>({ caption, columns, rows, getRowHref, getRowKey, emptyMessage }: Props<T>) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-m">{emptyMessage}</p>
  }

  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-ivory-k text-left text-2xs uppercase tracking-wide text-ink-m">
          {columns.map((col) => (
            <th key={col.key} scope="col" className="py-2.5 px-2 font-normal first:pl-0">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)} className="border-b border-ivory-d last:border-0 hover:bg-ivory transition-colors">
            {columns.map((col, colIndex) => (
              <td key={col.key} className="py-3 px-2 text-ink first:pl-0">
                {colIndex === 0 && getRowHref ? (
                  <Link
                    href={getRowHref(row)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                  >
                    {col.render(row)}
                  </Link>
                ) : (
                  col.render(row)
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
