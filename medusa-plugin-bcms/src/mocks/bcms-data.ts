/**
 * Mock BCMS data for development and testing.
 * Replace with real BCMS API calls when integrating.
 */

export interface BcmsContentType {
  id: string
  name: string
  label: string
  description?: string
}

export interface BcmsEntry {
  id: string
  contentTypeId: string
  locale: string
  status: string
  createdAt: string
  updatedAt: string
  meta?: Record<string, unknown>
}

export interface BcmsPage {
  id: string
  slug: string
  title: string
  description?: string
  template: string
  locale: string
  status: string
  createdAt: string
  updatedAt: string
  content?: Record<string, unknown>
}

export const MOCK_CONTENT_TYPES: BcmsContentType[] = [
  {
    id: "ct_blog_post",
    name: "blog_post",
    label: "Blog Post",
    description: "Blog articles and news",
  },
  {
    id: "ct_landing_page",
    name: "landing_page",
    label: "Landing Page",
    description: "Marketing landing pages",
  },
  {
    id: "ct_banner",
    name: "banner",
    label: "Banner",
    description: "Promotional banners",
  },
]

export const MOCK_ENTRIES: BcmsEntry[] = [
  {
    id: "entry_1",
    contentTypeId: "ct_blog_post",
    locale: "en",
    status: "published",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-03-01T14:30:00Z",
    meta: { title: "Welcome to Our Store", slug: "welcome-post" },
  },
  {
    id: "entry_2",
    contentTypeId: "ct_blog_post",
    locale: "en",
    status: "published",
    createdAt: "2025-02-10T09:00:00Z",
    updatedAt: "2025-02-20T11:00:00Z",
    meta: { title: "Spring Collection Preview", slug: "spring-collection" },
  },
  {
    id: "entry_3",
    contentTypeId: "ct_banner",
    locale: "en",
    status: "published",
    createdAt: "2025-03-01T08:00:00Z",
    updatedAt: "2025-03-01T08:00:00Z",
    meta: { headline: "Free shipping on orders over $50" },
  },
]

export const MOCK_PAGES: BcmsPage[] = [
  {
    id: "page_1",
    slug: "about",
    title: "About Us",
    description: "Learn more about our brand",
    template: "default",
    locale: "en",
    status: "published",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-15T12:00:00Z",
    content: {
      hero: { title: "About Our Brand", subtitle: "Quality since 2020" },
      body: "Mock CMS content for the about page.",
    },
  },
  {
    id: "page_2",
    slug: "faq",
    title: "FAQ",
    description: "Frequently asked questions",
    template: "default",
    locale: "en",
    status: "published",
    createdAt: "2025-01-20T00:00:00Z",
    updatedAt: "2025-03-01T09:00:00Z",
    content: {
      sections: [
        { question: "Shipping times?", answer: "2-5 business days." },
        { question: "Returns?", answer: "30-day return policy." },
      ],
    },
  },
]
