import { Text, Button, Section, Row, Column } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';

interface AffiliateConversionEmailProps {
  affiliateName: string;
  couponTitle: string;
  commissionAmount: number;
  orderValue?: number;
  commissionRate: number;
  dashboardUrl: string;
  locale?: string;
}

export default function AffiliateConversionEmail({
  affiliateName,
  couponTitle,
  commissionAmount,
  orderValue,
  commissionRate,
  dashboardUrl,
  locale = 'en',
}: AffiliateConversionEmailProps) {
  const isRTL = locale === 'ar' || locale === 'he';

  const content = {
    en: {
      preview: 'You earned a commission!',
      greeting: `Hi ${affiliateName},`,
      title: 'You Earned a Commission! 💰',
      message: `Congratulations! You just earned a commission from your affiliate link.`,
      details: 'Details:',
      coupon: 'Coupon',
      commission: 'Commission',
      orderValue: 'Order Value',
      rate: 'Rate',
      cta: 'View Dashboard',
      footer: 'Keep sharing your links to earn more commissions!',
    },
    ar: {
      preview: 'لقد ربحت عمولة!',
      greeting: `مرحبًا ${affiliateName}،`,
      title: 'لقد ربحت عمولة! 💰',
      message: `تهانينا! لقد ربحت للتو عمولة من رابط الإحالة الخاص بك.`,
      details: 'التفاصيل:',
      coupon: 'الكوبون',
      commission: 'العمولة',
      orderValue: 'قيمة الطلب',
      rate: 'النسبة',
      cta: 'عرض لوحة التحكم',
      footer: 'استمر في مشاركة الروابط الخاصة بك لكسب المزيد من العمولات!',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <EmailLayout locale={locale} preview={t.preview}>
      <Text style={greetingStyle}>{t.greeting}</Text>
      <Text style={titleStyle}>{t.title}</Text>
      <Text style={messageStyle}>{t.message}</Text>

      <Section style={detailsBoxStyle}>
        <Text style={detailsHeaderStyle}>{t.details}</Text>
        
        <Row style={detailRowStyle}>
          <Column style={detailLabelStyle}>{t.coupon}:</Column>
          <Column style={detailValueStyle}>{couponTitle}</Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={detailLabelStyle}>{t.commission}:</Column>
          <Column style={highlightValueStyle}>${commissionAmount.toFixed(2)}</Column>
        </Row>

        {orderValue && (
          <Row style={detailRowStyle}>
            <Column style={detailLabelStyle}>{t.orderValue}:</Column>
            <Column style={detailValueStyle}>${orderValue.toFixed(2)}</Column>
          </Row>
        )}

        <Row style={detailRowStyle}>
          <Column style={detailLabelStyle}>{t.rate}:</Column>
          <Column style={detailValueStyle}>{commissionRate}%</Column>
        </Row>
      </Section>

      <Section style={buttonContainerStyle}>
        <Button href={dashboardUrl} style={buttonStyle}>
          {t.cta}
        </Button>
      </Section>

      <Text style={footerMessageStyle}>{t.footer}</Text>
    </EmailLayout>
  );
}

const greetingStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 10px 0',
  color: '#32325d',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '20px 0',
  color: '#32325d',
};

const messageStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px 0',
  color: '#525f7f',
};

const detailsBoxStyle = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const detailsHeaderStyle = {
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 15px 0',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
};

const detailRowStyle = {
  margin: '10px 0',
};

const detailLabelStyle = {
  fontSize: '14px',
  color: '#8898aa',
  width: '40%',
};

const detailValueStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#32325d',
};

const highlightValueStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#10b981',
};

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const buttonStyle = {
  backgroundColor: '#556cd6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
};

const footerMessageStyle = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '20px 0 0 0',
  color: '#8898aa',
};
