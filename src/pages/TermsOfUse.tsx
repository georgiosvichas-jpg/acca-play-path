import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-display font-bold mb-8">Terms of Use</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/80">
            <strong>Last Updated:</strong> January 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Outcomeo ("the Platform"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">2. Description of Service</h2>
            <p>
              Outcomeo is an online learning platform designed to help students prepare for ACCA examinations. We provide study tools including flashcards, practice questions, progress tracking, analytics, and personalized study plans.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-foreground mt-4">3.1 Registration</h3>
            <p>
              You must create an account to access our services. You agree to provide accurate, current, and complete information during registration and to update it as necessary.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-4">3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">3.3 Account Eligibility</h3>
            <p>
              You must be at least 16 years old to use our services. By creating an account, you represent that you meet this age requirement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">4. Subscription and Payment</h2>
            <h3 className="text-xl font-semibold text-foreground mt-4">4.1 Free and Paid Plans</h3>
            <p>
              We offer both free and paid subscription plans. Paid plans provide access to additional features and content as described on our pricing page.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">4.2 Billing</h3>
            <p>
              Subscriptions are billed in advance on a monthly or annual basis. By subscribing, you authorize us to charge your payment method for the applicable fees.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">4.3 Cancellation and Refunds</h3>
            <p>
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. We offer a 7-day money-back guarantee for new subscribers. No refunds are provided for partial periods.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">4.4 Price Changes</h3>
            <p>
              We reserve the right to modify subscription prices with 30 days' notice. Continued use after price changes constitutes acceptance of the new prices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Share your account credentials with others</li>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Copy, reproduce, or distribute our content without permission</li>
              <li>Use automated tools to scrape or download content</li>
              <li>Interfere with the proper functioning of the Platform</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">6. Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-foreground mt-4">6.1 Our Content</h3>
            <p>
              All content on the Platform, including text, graphics, logos, questions, explanations, and software, is the property of Outcomeo or its licensors and is protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">6.2 Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and use the Platform for your personal, non-commercial study purposes.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">6.3 User Content</h3>
            <p>
              You retain ownership of any content you create or upload. By using our services, you grant us a license to use, store, and display your content as necessary to provide our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">7. ACCA Affiliation Disclaimer</h2>
            <p>
              Outcomeo is an independent study platform and is not affiliated with, endorsed by, or sponsored by ACCA (Association of Chartered Certified Accountants). ACCA is a registered trademark of the Association of Chartered Certified Accountants.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">8. Disclaimers</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Platform will be uninterrupted or error-free</li>
              <li>Use of the Platform will result in passing your exams</li>
              <li>All content is accurate, complete, or current</li>
              <li>The Platform will meet your specific requirements</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUTCOMEO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Outcomeo, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the Platform or violation of these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason. Upon termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Platform. Your continued use after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable international laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">14. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <p className="font-semibold">
              Email: legal@outcomeo.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}