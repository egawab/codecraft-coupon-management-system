import { Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';

interface CouponApprovedEmailProps {
  couponTitle: string;
  couponCode: string;
  storeOwnerName: string;
  couponUrl: string;
  locale?: string;
}

export default function CouponApprovedEmail({
  couponTitle,
  couponCode,
  storeOwnerName,
  couponUrl,
  locale = 'en',
}: CouponApprovedEmailProps) {
  const isRTL = locale === 'ar' || locale === 'he';

  const content = {
    en: {
      preview: 'Your coupon has been approved!',
      greeting: `Hi ${storeOwnerName},`,
      title: 'Your Coupon Has Been Approved! 🎉',
      message: `Great news! Your coupon "${couponTitle}" (${couponCode}) has been approved and is now live on our platform.`,
      cta: 'View Coupon',
      footer: 'Users can now discover and use your coupon. Start promoting it to maximize your reach!',
    },
    ar: {
      preview: 'تمت الموافقة على الكوبون الخاص بك!',
      greeting: `مرحبًا ${storeOwnerName}،`,
      title: 'تمت الموافقة على الكوبون! 🎉',
      message: `أخبار رائعة! تمت الموافقة على الكوبون "${couponTitle}" (${couponCode}) وأصبح الآن متاحًا على منصتنا.`,
      cta: 'عرض الكوبون',
      footer: 'يمكن للمستخدمين الآن اكتشاف واستخدام الكوبون الخاص بك. ابدأ في الترويج له لزيادة الوصول!',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <EmailLayout locale={locale} preview={t.preview}>
      <Text style={greetingStyle}>{t.greeting}</Text>
      <Text style={titleStyle}>{t.title}</Text>
      <Text style={messageStyle}>{t.message}</Text>
      
      <Section style={buttonContainerStyle}>
        <Button href={couponUrl} style={buttonStyle}>
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
