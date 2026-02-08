import { Text, Button, Section, Row, Column } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';

interface PayoutApprovedEmailProps {
  affiliateName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  dashboardUrl: string;
  locale?: string;
}

export default function PayoutApprovedEmail({
  affiliateName,
  amount,
  paymentMethod,
  transactionId,
  dashboardUrl,
  locale = 'en',
}: PayoutApprovedEmailProps) {
  const content = {
    en: {
      preview: 'Your payout has been approved!',
      greeting: `Hi ${affiliateName},`,
      title: 'Your Payout Has Been Approved! ✅',
      message: `Great news! Your payout request has been approved and processed.`,
      details: 'Payout Details:',
      amount: 'Amount',
      method: 'Payment Method',
      transaction: 'Transaction ID',
      cta: 'View Dashboard',
      footer: 'The funds should arrive in your account within 3-5 business days.',
    },
    ar: {
      preview: 'تمت الموافقة على طلب السحب!',
      greeting: `مرحبًا ${affiliateName}،`,
      title: 'تمت الموافقة على طلب السحب! ✅',
      message: `أخبار رائعة! تمت الموافقة على طلب السحب الخاص بك ومعالجته.`,
      details: 'تفاصيل الدفع:',
      amount: 'المبلغ',
      method: 'طريقة الدفع',
      transaction: 'معرف المعاملة',
      cta: 'عرض لوحة التحكم',
      footer: 'من المفترض أن تصل الأموال إلى حسابك في غضون 3-5 أيام عمل.',
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
          <Column style={detailLabelStyle}>{t.amount}:</Column>
          <Column style={highlightValueStyle}>${amount.toFixed(2)}</Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={detailLabelStyle}>{t.method}:</Column>
          <Column style={detailValueStyle}>{paymentMethod}</Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={detailLabelStyle}>{t.transaction}:</Column>
          <Column style={detailValueStyle}>{transactionId}</Column>
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
  fontSize: '20px',
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
