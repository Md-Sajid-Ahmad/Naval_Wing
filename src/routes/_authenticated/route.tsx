import { createFileRoute, Outlet } from "@tanstack/react-router";

// লগইন সরিয়ে দেওয়া হয়েছে — সবাই সরাসরি অ্যাপ ব্যবহার করতে পারবে।
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => <Outlet />,
});
