import Footer from "@/components/Footer";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 md:px-8">
        <h1 className="text-4xl font-display font-bold mb-8">Disclaimer</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Educational Purpose Only</h2>
            <p className="text-muted-foreground">
              The content provided by Outcomeo is for educational and informational purposes only. While we strive to provide accurate and up-to-date study materials, practice questions, and exam preparation resources, we make no representations or warranties regarding the completeness, accuracy, or reliability of any content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Not Official Exam Content</h2>
            <p className="text-muted-foreground">
              Outcomeo is an independent study platform and is not affiliated with, endorsed by, or sponsored by ACCA (Association of Chartered Certified Accountants) or any other professional accounting body. Our practice questions and study materials are created independently and do not represent official exam content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Guarantee of Exam Success</h2>
            <p className="text-muted-foreground">
              While our platform is designed to help you prepare for your exams, we cannot guarantee that using our services will result in passing any examination. Your success depends on various factors including your dedication, study habits, prior knowledge, and exam performance on the day.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Content Accuracy</h2>
            <p className="text-muted-foreground mb-4">
              We make reasonable efforts to ensure that our content is accurate and current. However:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Exam syllabuses and requirements may change</li>
              <li>Accounting standards and regulations are subject to updates</li>
              <li>Errors or omissions may occur despite our quality control measures</li>
              <li>Users should verify critical information with official sources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Not Professional Advice</h2>
            <p className="text-muted-foreground">
              The information provided through our Service does not constitute professional accounting, legal, tax, or financial advice. You should consult with qualified professionals for specific advice related to your situation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Content and Links</h2>
            <p className="text-muted-foreground">
              Our Service may contain links to third-party websites or resources. We are not responsible for the content, accuracy, or availability of these external sites. The inclusion of any link does not imply endorsement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            <p className="text-muted-foreground">
              We strive to maintain continuous service availability but cannot guarantee uninterrupted access. The Service may be subject to downtime, maintenance, updates, or technical issues beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User-Generated Content</h2>
            <p className="text-muted-foreground">
              Any user-generated content, including forum posts, comments, or shared notes, represents the views of the individual users and not Outcomeo. We do not endorse or verify the accuracy of user-generated content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data and Statistics</h2>
            <p className="text-muted-foreground">
              Performance statistics, leaderboards, and analytics provided by the Service are for motivational and tracking purposes only. They should not be used as the sole indicator of exam readiness or future performance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TO THE FULLEST EXTENT PERMITTED BY LAW, OUTCOMEO SHALL NOT BE LIABLE FOR ANY DAMAGES, INCLUDING BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES ARISING FROM:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Your use or inability to use the Service</li>
              <li>Exam failure or unsatisfactory exam results</li>
              <li>Errors or inaccuracies in content</li>
              <li>Loss of data or study progress</li>
              <li>Any reliance on content provided through the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Supplementary Study Tool</h2>
            <p className="text-muted-foreground">
              Outcomeo is designed to supplement, not replace, comprehensive exam preparation. Users are encouraged to use multiple study resources, attend official courses where available, and refer to official exam materials published by the relevant examining bodies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates and Changes</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without notice. We may also update this Disclaimer periodically to reflect changes in our practices or legal requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Copyright Notice</h2>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Outcomeo. All rights reserved. All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are the exclusive property of Outcomeo and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              If you have any questions or concerns about this Disclaimer, please contact us through our support channels.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
