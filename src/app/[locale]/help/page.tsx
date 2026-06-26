import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { createMetadata, createJsonLd } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });
  const seo = await getTranslations({ locale, namespace: 'seo' });

  return createMetadata({
    title: t('title'),
    description: seo('help.description'),
    locale,
    path: '/help',
  });
}

export default function HelpPage() {
  const t = useTranslations('help');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd('FAQPage', {
          mainEntity: [
            {
              '@type': 'Question',
              name: t('q1'),
              acceptedAnswer: { '@type': 'Answer', text: t('a1') }
            },
            {
              '@type': 'Question',
              name: t('q2'),
              acceptedAnswer: { '@type': 'Answer', text: t('a2') }
            },
            {
              '@type': 'Question',
              name: t('q3'),
              acceptedAnswer: { '@type': 'Answer', text: t('a3') }
            },
            {
              '@type': 'Question',
              name: t('q4'),
              acceptedAnswer: { '@type': 'Answer', text: t('a4') }
            }
          ]
        })}
      />
      <LandingHeader />
      <main className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('title')}</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q1')}</h2>
            <p>{t('a1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q2')}</h2>
            <p>{t('a2')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q3')}</h2>
            <p>{t('a3')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q4')}</h2>
            <p>{t('a4')}</p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
