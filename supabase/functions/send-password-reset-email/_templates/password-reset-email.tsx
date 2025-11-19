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

interface PasswordResetEmailProps {
  resetUrl: string
  email: string
}

export const PasswordResetEmail = ({
  resetUrl,
  email,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your StudyBuddy password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          Hi there,
        </Text>
        <Text style={text}>
          We received a request to reset the password for your StudyBuddy account associated with {email}.
        </Text>
        <Text style={text}>
          Click the button below to set a new password:
        </Text>
        <Section style={buttonContainer}>
          <Link
            href={resetUrl}
            target="_blank"
            style={button}
          >
            Reset Password
          </Link>
        </Section>
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={link}>
          {resetUrl}
        </Text>
        <Text style={warningText}>
          This password reset link will expire in 24 hours for security reasons.
        </Text>
        <Text style={footerText}>
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </Text>
        <Text style={footer}>
          StudyBuddy - Your ACCA Study Companion
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

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

const warningText = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '6px',
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
