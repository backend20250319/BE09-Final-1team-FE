// import { Inter } from "next/font/google"
import "./globals.css";
import { Providers } from "@/components/providers";
import Footer from "@/components/footer";

// const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "뉴스포털",
  description: "최신 뉴스를 실시간으로 확인하세요",
};


export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      {/* <body className={inter.className}> */}
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
