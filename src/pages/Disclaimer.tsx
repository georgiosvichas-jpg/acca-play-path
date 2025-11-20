import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function Disclaimer() {
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

        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-10 h-10 text-accent" />
          <h1 className="text-4xl font-display font-bold">Disclaimer</h1>
        </div>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/80">
            <strong>Last Updated:</strong> January 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">1. General Disclaimer</h2>
            <p>
              The information provided by Outcomeo ("we," "us," or "our") on our platform is for general educational and informational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">2. No ACCA Affiliation</h2>
            <p>
              <strong>IMPORTANT:</strong> Outcomeo is an independent educational platform and is NOT affiliated with, endorsed by, or sponsored by ACCA (Association of Chartered Certified Accountants). ACCA is a registered trademark of the Association of Chartered Certified Accountants.
            </p>
            <p>
              Our study materials, practice questions, and content are created independently based on publicly available ACCA syllabi and learning outcomes. We are not authorized by ACCA to provide official study materials or exam preparation courses.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">3. Educational Content Disclaimer</h2>
            <h3 className="text-xl font-semibold text-foreground mt-4">3.1 No Guarantee of Success</h3>
            <p>
              While we strive to provide high-quality educational content, we do not guarantee that using Outcomeo will result in passing your ACCA examinations. Exam success depends on many factors including individual effort, study habits, prior knowledge, and exam performance on the day.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">3.2 Supplementary Study Tool</h3>
            <p>
              Outcomeo is designed to supplement your ACCA exam preparation. It should not be your sole source of study material. We recommend using Outcomeo in conjunction with official ACCA study materials, approved learning providers, and comprehensive revision.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">3.3 Content Accuracy</h3>
            <p>
              While we make every effort to ensure our content is accurate and up-to-date with the current ACCA syllabus, we cannot guarantee that all information is completely accurate, current, or applicable to your specific exam session. ACCA syllabi and exam formats may change.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">4. Technical Disclaimer</h2>
            <h3 className="text-xl font-semibold text-foreground mt-4">4.1 Service Availability</h3>
            <p>
              We strive to maintain continuous platform availability, but we do not guarantee that the Platform will be available at all times. Technical issues, maintenance, or circumstances beyond our control may result in service interruptions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-4">4.2 Data Accuracy</h3>
            <p>
              While we implement safeguards to protect data integrity, technical errors may occasionally result in incorrect progress tracking, analytics, or other data discrepancies. We are not liable for any consequences resulting from such technical issues.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">5. Third-Party Links and Services</h2>
            <p>
              Our Platform may contain links to third-party websites or services that are not owned or controlled by Outcomeo. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">6. Professional Advice Disclaimer</h2>
            <p>
              The content on our Platform is not intended as professional advice. You should not rely solely on information from Outcomeo for making academic or professional decisions. Always consult with qualified professionals or official ACCA resources for specific guidance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">7. No Warranty</h2>
            <p>
              THE PLATFORM AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OUTCOMEO, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, OR AFFILIATES BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exam failures or poor performance</li>
              <li>Lost study time or opportunity costs</li>
              <li>Incorrect or outdated information</li>
              <li>Technical issues or data loss</li>
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">9. User Responsibility</h2>
            <p>
              Users are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verifying the accuracy of information before relying on it</li>
              <li>Ensuring adequate exam preparation through multiple sources</li>
              <li>Meeting all ACCA registration and exam requirements</li>
              <li>Understanding official ACCA exam regulations and procedures</li>
              <li>Maintaining backup study materials and resources</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">10. Updates to Content</h2>
            <p>
              We may update, modify, or remove content at any time without notice. We are not obligated to update information when ACCA syllabi change, though we strive to keep our content current.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">11. Testimonials and Results</h2>
            <p>
              Any testimonials or success stories displayed on our Platform reflect individual experiences and should not be considered typical or guaranteed. Your results may vary significantly based on numerous factors unique to your situation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">12. Changes to Disclaimer</h2>
            <p>
              We reserve the right to modify this Disclaimer at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform after changes constitutes acceptance of the modified Disclaimer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">13. Official ACCA Resources</h2>
            <p>
              For official information about ACCA examinations, syllabi, registration, and requirements, please visit the official ACCA website at <a href="https://www.accaglobal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.accaglobal.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground mt-8">14. Contact Information</h2>
            <p>
              If you have questions about this Disclaimer, please contact us at:
            </p>
            <p className="font-semibold">
              Email: support@outcomeo.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}