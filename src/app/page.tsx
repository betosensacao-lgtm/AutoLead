import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold text-xl">AutoLead</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/chat"
              className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Try Chat
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="font-display text-5xl font-bold max-w-2xl leading-tight">
          Turn your visitors into{" "}
          <span className="text-brand-600">qualified customers</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mt-6 leading-relaxed">
          AutoLead uses AI agents to capture, qualify, and nurture leads
          automatically via chat, WhatsApp, and email — 24/7.
        </p>
        <div className="flex gap-4 mt-10">
          <Link
            href="/chat"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Try Now
          </Link>
          <Link
            href="/admin/signup"
            className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Create Account
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-20">
          {[
            {
              title: "Smart Capture",
              desc: "Collect lead data naturally during conversation across any channel.",
            },
            {
              title: "BANT Qualification",
              desc: "Evaluate budget, authority, need, and timeline automatically with AI agents.",
            },
            {
              title: "Automated Nurturing",
              desc: "Personalized follow-up sequences via email and WhatsApp at the right time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="border border-border rounded-xl p-6 text-left"
            >
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        AutoLead — AI-Powered Sales Automation System
      </footer>
    </div>
  );
}
