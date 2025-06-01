import { Suspense } from "react";
import HomePage from "@/components/Homepage";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
