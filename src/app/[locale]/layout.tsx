import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, Locale } from "@/i18n/routing";
import "./globals.css";
import Header from "@/components/header/Header";


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
      
          <NextIntlClientProvider messages={messages}>
            <Header />
            {children}
          </NextIntlClientProvider>
     
      </body>
    </html>
  );
}
