const Footer = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto py-10 grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-2">BeAlbanian</h3>
          <p className="text-sm text-muted-foreground">Learn Albanian, feel Albanian.</p>
        </div>
        <nav className="grid grid-cols-2 gap-4 text-sm">
          <a href="/about" className="hover:underline">Rreth nesh</a>
          <a href="/explore" className="hover:underline">Eksploro</a>
          <a href="/learn" className="hover:underline">Mëso</a>
          <a href="/culture/cities" className="hover:underline">Qytete</a>
          <a href="/culture/figures" className="hover:underline">Figura</a>
          <a href="/culture/traditions" className="hover:underline">Tradita</a>
        </nav>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BeAlbanian. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
