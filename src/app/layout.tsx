import type { Metadata } from "next";
import NavBar from "./components/navBar";
import { UserContextProvider } from "@/context/userContext";

export const metadata: Metadata = {
  title: "TaskTally",
  description: "Devon Ceccacci, Final Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserContextProvider>
          <header><NavBar/></header>
          <main>{children}</main>
        </UserContextProvider>
      </body>
    </html>
  );
}
