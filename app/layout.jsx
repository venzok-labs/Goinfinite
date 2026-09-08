import "./globals.css";
import ScrollCompanion from "../components/ScrollCompanion";

export const metadata = {
  title: "Infinite Solutions — Engineering Intelligence. From Concept to Reality.",
  description:
    "Integrated engineering services: concept design, CAE validation, advanced measurement, manufacturing, testing and special-purpose machine development.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <ScrollCompanion />
      </body>
    </html>
  );
}
