import './global.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/create-alert">Create Alert</a>
        </nav>
        {children}
      </body>
    </html>
  );
}