import { prisma } from '@/lib/prisma'
import AdminDataTable from '@/components/crafttrack/admin/AdminDataTable'
import SendLoginLinkButton from '@/components/crafttrack/admin/SendLoginLinkButton'
import NewCustomerForm from './NewCustomerForm'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Customers</h1>

      <details className="bg-white border border-ivory-k rounded-sm p-5 mb-8">
        <summary className="text-sm text-ink cursor-pointer select-none">+ New customer</summary>
        <div className="mt-4 max-w-sm">
          <NewCustomerForm />
        </div>
      </details>

      <AdminDataTable
        caption="Customers"
        emptyMessage="No customers yet."
        rows={customers}
        getRowKey={(c) => c.id}
        columns={[
          { key: 'name', header: 'Name', render: (c) => c.name },
          { key: 'email', header: 'Email', render: (c) => c.email },
          { key: 'orders', header: 'Orders', render: (c) => c._count.orders },
          {
            key: 'login',
            header: 'Login',
            render: (c) => <SendLoginLinkButton customerId={c.id} hasPassword={!!c.passwordHash} />,
          },
        ]}
      />
    </div>
  )
}
