import { Metadata } from 'next'

const SITE_URL = 'https://ouf.netlify.app'

export const metadata: Metadata = {
  title: 'Ouf!',
  description: "Create and personalize an AI assistant tailored to your organization's needs",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Ouf!',
    description: "Create and personalize an AI assistant tailored to your organization's needs",
    siteName: 'Ouf - AI Assistant',
    images: [
      {
        url: '/huangshan.png',
        width: 1200,
        height: 630,
        alt: 'Ouf AI Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@w3hc8',
    title: 'Ouf!',
    description: "Create and personalize an AI assistant tailored to your organization's needs",
    images: ['/huangshan.png'],
  },
}
