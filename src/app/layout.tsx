import type { Metadata } from "next";
import { TaskContextProvider } from "@/context/taskContext";

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
        <TaskContextProvider>
          <main>{children}</main>
        </TaskContextProvider>
      </body>
    </html>
  );
}
