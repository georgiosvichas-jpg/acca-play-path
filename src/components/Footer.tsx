export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 mt-12 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <p className="text-center text-sm text-muted-foreground">
          This app uses content inspired by the official ACCA syllabus. All intellectual property
          rights for ACCA materials belong to{" "}
          <a
            href="https://www.accaglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            ACCA (the Association of Chartered Certified Accountants)
          </a>
          . No official exam content is reproduced.
        </p>
      </div>
    </footer>
  );
}
