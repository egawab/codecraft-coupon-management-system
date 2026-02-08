import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  locale?: string;
  preview?: string;
}

export function EmailLayout({ children, locale = 'en', preview }: LayoutProps) {
  const isRTL = locale === 'ar' || locale === 'he';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  return (
    <Html dir={dir} lang={locale}>
      <Head>
        {preview && <title>{preview}</title>}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
          
          body {
            font-family: ${isRTL ? "'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif"};
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          
          .rtl {
            direction: rtl;
            text-align: ${isRTL ? 'right' : 'left'};
          }
        `}</style>
      </Head>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`}
              alt="Kobonz"
              width="120"
              height="40"
              style={logoStyle}
            />
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={hrStyle} />
            <Text style={footerTextStyle}>
              {isRTL ? 'هذه رسالة تلقائية، الرجاء عدم الرد عليها.' : 'This is an automated message, please do not reply.'}
            </Text>
            <Text style={footerTextStyle}>
              {isRTL ? '© 2024 Kobonz. جميع الحقوق محفوظة.' : '© 2024 Kobonz. All rights reserved.'}
            </Text>
            <Text style={footerTextStyle}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`} style={linkStyle}>
                {isRTL ? 'إلغاء الاشتراك' : 'Unsubscribe'}
              </Link>
              {' | '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/privacy`} style={linkStyle}>
                {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const mainStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const headerStyle = {
  padding: '20px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
};

const logoStyle = {
  margin: '0 auto',
};

const contentStyle = {
  padding: '40px 30px',
};

const footerStyle = {
  padding: '30px',
  backgroundColor: '#f6f9fc',
};

const hrStyle = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerTextStyle = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8898aa',
  textAlign: 'center' as const,
  margin: '5px 0',
};

const linkStyle = {
  color: '#556cd6',
  textDecoration: 'none',
};
