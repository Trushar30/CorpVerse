export default function Footer() {
  return (
    <footer className="w-full bg-cozy-base border-t-[1.5px] border-cozy-border-accent mt-10">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <span className="font-sans font-bold text-lg text-cozy-text-primary tracking-tight mb-4 block">
              CorpVerse
            </span>
            <p className="font-sans text-[14px] text-cozy-text-secondary leading-relaxed">
              A cozy career simulation where you grow at your own pace.
            </p>
          </div>

          <div>
            <h4 className="font-sans font-bold text-[14px] text-cozy-text-primary mb-4">
              Explore
            </h4>
            <ul className="space-y-3 font-sans text-[14px] text-cozy-text-secondary">
              <li><a href="#features" className="hover:text-cozy-accent-primary transition-colors">Features</a></li>
              <li><a href="#journey" className="hover:text-cozy-accent-primary transition-colors">The Journey</a></li>
              <li><a href="#companies" className="hover:text-cozy-accent-primary transition-colors">Seed Market</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold text-[14px] text-cozy-text-primary mb-4">
              Connect
            </h4>
            <ul className="space-y-3 font-sans text-[14px] text-cozy-text-secondary">
              <li><a href="#" className="hover:text-cozy-accent-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-cozy-accent-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-cozy-accent-primary transition-colors">GitHub</a></li>
            </ul>
          </div>

        </div>

        {/* Pixel divider placeholder */}
        <div className="w-full flex justify-center gap-4 mb-8 opacity-20 text-cozy-text-secondary font-mono text-[10px]">
            +++
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-cozy-text-muted">
          <p>© {new Date().getFullYear()} CorpVerse · made with cozy pixels</p>
        </div>
      </div>
    </footer>
  );
}
