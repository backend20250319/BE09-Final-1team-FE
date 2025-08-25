import { Inter, Nanum_Gothic, Nanum_Myeongjo, Nanum_Brush_Script } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })
const nanumGothic = Nanum_Gothic({ 
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum-gothic"
})
const nanumMyeongjo = Nanum_Myeongjo({ 
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum-myeongjo"
})
const nanumBrush = Nanum_Brush_Script({ 
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-nanum-brush"
})

export const metadata = {
  title: "뉴스포털",
  description: "최신 뉴스를 실시간으로 확인하세요",
};


export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} ${nanumGothic.variable} ${nanumMyeongjo.variable} ${nanumBrush.variable}`}>
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
