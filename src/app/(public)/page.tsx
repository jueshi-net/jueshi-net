import HomeLivePage from '@/components/home-live/HomeLivePage';

export const metadata = {
  title: '绝世百宝箱 - 海外华人的实用工具箱',
  description: '绝世百宝箱提供集运、物流、外贸单据、跨境电商、留学生活等实用工具，支持在线生成、保存草稿和工作台管理。',
  keywords: '绝世百宝箱,海外华人工具,跨境工具,邮编查询,HS编码查询,汇率换算,国际运费计算,外贸单据工具,海外生活指南,出国清单,跨境电商工具,实用工具导航',
  alternates: { canonical: 'https://jueshi.net/' },
};

export default function HomePage() {
  return <HomeLivePage />;
}
