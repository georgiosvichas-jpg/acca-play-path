import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface VerificationEmailProps {
  confirmationUrl: string
  email: string
}

export const VerificationEmail = ({
  confirmationUrl,
  email,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify your email</Heading>
        <Text style={text}>
          Welcome to StudyBuddy! We're excited to have you on board.
        </Text>
        <Text style={text}>
          To complete your registration and start your ACCA study journey, please verify your email address by clicking the button below:
        </Text>
        <Section style={buttonContainer}>
          <Link
            href={confirmationUrl}
            target="_blank"
            style={button}
          >
            Verify Email Address
          </Link>
        </Section>
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={link}>
          {confirmationUrl}
        </Text>
        <Text style={footerText}>
          If you didn't create an account with StudyBuddy, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          StudyBuddy - Your ACCA Study Companion
        </Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
  lineHeight: '1.3',
}

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
  textDecoration: 'none',
}

const link = {
  color: '#6366f1',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
}

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 16px',
}

const footer = {
  color: '#a3a3a3',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
}
