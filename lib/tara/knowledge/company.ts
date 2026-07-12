/** Company module — verified facts only. Nothing beyond this may be asserted. */
import type { TaraFact } from './types'

export const COMPANY_FACTS = {
  identity: 'TAPIS GLOBAL INTERNATIONAL PVT LTD is a B2B made-to-order carpet and rug manufacturer.',
  locations: 'Corporate office in Delhi; manufacturing operations in Bhadohi, India.',
  model: 'Made to order to buyer specifications — design, size, colours, material, fibre quality, construction and quantity. Not a retail/ready-stock store.',
  timeline: 'Typical production/dispatch is approximately 3–4 weeks, subject to specifications and quantity.',
  process: 'Enquiry → requirement discussion → design & sampling → approval → production → quality checks → dispatch.',
  buyers: 'Architects, interior designers, hotels/resorts, hospitality procurement, builders/developers, importers, distributors, wholesalers, dealers, furniture retailers, sourcing companies, OEM/private-label and institutional buyers.',
  oem: 'OEM and private-label manufacturing are supported — designs and specifications are produced to the buyer\'s brief; the team confirms the specifics per project.',
}

export const COMPANY_MODULE: TaraFact[] = [
  { id: 'company-identity', title: 'About TAPIS GLOBAL', body: `${COMPANY_FACTS.identity} ${COMPANY_FACTS.locations}`, tags: ['company', 'about', 'delhi', 'bhadohi'] },
  { id: 'company-model', title: 'Made-to-order model', body: COMPANY_FACTS.model, tags: ['made to order', 'custom', 'model'] },
  { id: 'company-process', title: 'How an order works', body: `${COMPANY_FACTS.process} ${COMPANY_FACTS.timeline}`, tags: ['process', 'sampling', 'production', 'timeline', 'lead time'] },
  { id: 'company-oem', title: 'OEM & private label', body: COMPANY_FACTS.oem, tags: ['oem', 'private label', 'wholesale', 'importer'] },
]

export const BUYER_TYPES = [
  'Architect', 'Interior Designer', 'Hotel / Resort', 'Hospitality Procurement', 'Builder / Developer',
  'Importer', 'Distributor', 'Wholesaler', 'Carpet Dealer', 'Furniture Retailer', 'Sourcing Company',
  'OEM Buyer', 'Private Label Buyer', 'Institutional Buyer', 'Personal Project', 'Other',
]

/** Fields a consultant naturally gathers to qualify a project before quotation. */
export const QUALIFICATION_FIELDS = [
  'project type', 'country', 'city', 'buyer type', 'approximate size', 'quantity',
  'material / fibre', 'construction', 'colours', 'pattern / design', 'quality positioning',
  'timeline', 'samples needed', 'quotation needed', 'destination',
]
