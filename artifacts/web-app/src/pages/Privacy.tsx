import { useNavigate } from "react-router-dom";

const COMPANY = "Mirkov Holding LLC";
const ADDRESS = "2055 Limestone Rd STE 200-C, Wilmington, DE 19808, New Castle, US";
const EFFECTIVE_DATE = "April 17, 2026";

const MoolabLogo = ({ height = 32 }: { height?: number }) => (
  <img
    src="/moolab-logo-trimmed.png"
    alt="Moolab"
    style={{ height, width: "auto", objectFit: "contain" }}
  />
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg sm:text-xl font-black text-[#145374] mb-3 tracking-tight">{title}</h2>
      <div className="text-sm sm:text-[15px] text-[#0c2d48]/75 font-medium leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-['Bricolage_Grotesque','Lato',system-ui,sans-serif] text-[#0c2d48]">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            aria-label="Back to home"
            className="flex items-center gap-2 cursor-pointer"
          >
            <MoolabLogo height={34} />
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full border border-sky-200 text-[#145374] font-bold text-xs sm:text-sm tracking-wide hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <main className="pt-28 sm:pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-200 text-[#145374] font-bold text-xs tracking-wide hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            ← Back to Home
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/60 border border-sky-200/50 mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Privacy{" "}
            <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-sm text-[#0c2d48]/45 font-medium mb-2">Effective date: {EFFECTIVE_DATE}</p>

          <div className="rounded-2xl border border-sky-200/60 bg-sky-50/40 p-5 sm:p-6 mb-10">
            <div className="text-[10px] font-black tracking-[0.2em] uppercase text-[#145374] mb-2">Operated by</div>
            <div className="text-base font-extrabold text-[#0c2d48]">{COMPANY}</div>
            <div className="text-sm text-[#0c2d48]/65 font-semibold mt-1">{ADDRESS}</div>
          </div>

          <Section title="1. Introduction">
            <p>
              {COMPANY} ("we," "us," or "our") operates Moolab, an educational mobile and web application designed to teach financial literacy to children and young adults aged 8–21. This Privacy Policy explains how we collect, use, and protect personal information when you or your child use Moolab.
            </p>
            <p>
              We are committed to protecting children's privacy and complying with applicable laws, including the Children's Online Privacy Protection Act (COPPA) in the United States and the General Data Protection Regulation (GDPR) where applicable.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect only the minimum information necessary to provide the service:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Parent account information:</strong> name, email address, and password (stored hashed).</li>
              <li><strong>Child profile information:</strong> first name or display name, age range, and a parent-managed PIN. We do not collect last names, real-world addresses, or contact information for children.</li>
              <li><strong>Learning progress:</strong> XP, streak, completed lessons, and in-app currency ("Moolies") used solely to personalize the learning experience.</li>
              <li><strong>Device and usage information:</strong> basic technical logs (device type, app version, error reports) to keep the service stable and secure.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Deliver age-appropriate educational content and personalize lessons.</li>
              <li>Track learning progress so parents can monitor their child's growth.</li>
              <li>Provide customer support and respond to inquiries.</li>
              <li>Maintain the security, integrity, and reliability of the service.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>
              We do not use children's personal information for behavioral advertising, profiling, or any commercial purpose unrelated to providing the educational service.
            </p>
          </Section>

          <Section title="4. Parental Consent and Control">
            <p>
              Child accounts on Moolab can only be created by a verified parent or legal guardian. The parent controls the child's PIN, can view all learning activity from the Parent Dashboard, and may request deletion of the child's profile at any time by contacting us.
            </p>
          </Section>

          <Section title="5. No Real Money. No Crypto.">
            <p>
              Moolab is a closed, simulated environment. No real money is traded, transferred, or stored on behalf of children. Cryptocurrency is strictly excluded from the platform. Any in-app currency ("Moolies") is fictional and has no real-world value.
            </p>
          </Section>

          <Section title="6. Sharing of Information">
            <p>
              We do not sell, rent, or trade personal information. We share information only with:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Service providers (e.g., cloud hosting, analytics for service performance) that are contractually bound to protect the information.</li>
              <li>Authorities, when required by law or to protect the rights, safety, and property of users or the public.</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>
              We use industry-standard safeguards including encrypted connections (HTTPS), hashed password storage, and access controls. No system can be guaranteed 100% secure, but we work continuously to protect the information entrusted to us.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain account and progress data for as long as the account is active. Parents may request deletion of any child profile or the entire account at any time. Upon verified request, we will delete personal information within a reasonable timeframe, except where retention is required by law.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the use of your personal information, to object to processing, and to data portability. To exercise these rights, contact us using the details below.
            </p>
          </Section>

          <Section title="10. International Users">
            <p>
              Moolab is operated from the United States. If you access the service from outside the U.S., your information may be transferred to, stored, and processed in the U.S. or other countries where our service providers operate.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated through the app or by email to the parent account. Continued use of Moolab after a policy update constitutes acceptance of the revised terms.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              For questions, requests, or concerns about this Privacy Policy or our practices, please contact:
            </p>
            <div className="rounded-xl border border-sky-200/60 bg-sky-50/40 p-5 mt-3">
              <div className="text-base font-extrabold text-[#0c2d48]">{COMPANY}</div>
              <div className="text-sm text-[#0c2d48]/70 font-semibold mt-1">{ADDRESS}</div>
              <div className="text-sm font-semibold mt-2">
                Email:{" "}
                <a href="mailto:contact@moolab.app" className="text-[#145374] underline decoration-sky-300 underline-offset-4 hover:text-[#2e8bc0] transition-colors">
                  contact@moolab.app
                </a>
              </div>
            </div>
          </Section>

          <div className="mt-12 pt-6 border-t border-sky-100 text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
