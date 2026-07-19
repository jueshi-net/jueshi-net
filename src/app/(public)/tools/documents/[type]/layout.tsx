import { Metadata } from 'next';
import { getDocumentType } from '@/lib/documents/document-types';

interface Props {
  params: { type: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = params;
  const docType = getDocumentType(type);
  
  if (!docType) {
    return {
      title: '单据生成器 - 绝世百宝箱',
      description: '在线生成外贸单据，支持商业发票、装箱单、销售合同等',
    };
  }

  const title = `${docType.titleZh} / ${docType.titleEn} - 绝世百宝箱`;
  const description = `${docType.description}。${docType.scenario}。免费在线生成，支持PDF/Word/Excel导出。`;
  const canonicalUrl = `https://jueshi.net/tools/documents/${type}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: '/og/default-og.png',
          width: 1200,
          height: 630,
          alt: docType.titleZh,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og/default-og.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function DocumentToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
