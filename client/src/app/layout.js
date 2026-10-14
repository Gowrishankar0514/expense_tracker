import "./globals.css";

export const metadata = {
  title: "SpendWise",
  description: "Track. Manage. Grow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
