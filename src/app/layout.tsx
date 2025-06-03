import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Article Management System",
  description: "A system to manage articles with user and admin roles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Navbar />
        <main className="">{children}</main>
        {/* <main className="container mx-auto p-4">{children}</main> */}
      </body>
    </html>
  );
}
