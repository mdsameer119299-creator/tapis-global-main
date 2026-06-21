// components/seo/JsonLd.tsx
// Drop this anywhere in a Server Component to inject JSON-LD.
//
// Usage:
//   import JsonLd from '@/components/seo/JsonLd'
//   import { webPageSchema } from '@/lib/structured-data'
//
//   <JsonLd schema={webPageSchema({ ... })} />

type Props = {
  schema: object | object[]
  id?: string
}

export default function JsonLd({ schema, id }: Props) {
  const json = JSON.stringify(
    Array.isArray(schema)
      ? { '@context': 'https://schema.org', '@graph': schema }
      : schema
  )

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
