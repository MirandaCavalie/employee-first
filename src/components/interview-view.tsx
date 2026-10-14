"use client";

import { useRouter } from "next/navigation";
import { InterviewRunner } from "@/components/interview-runner";
import { Empty } from "@/components/ui";
import { useActivePerson, useHydrated } from "@/lib/store";

export function InterviewView() {
  const hydrated = useHydrated();
  const person = useActivePerson();
  const router = useRouter();

  if (!hydrated) return <div className="shimmer h-64 rounded-2xl" />;
  if (!person) {
    return (
      <Empty title="Pick someone first">
        Open People, invite a person, then come back to the conversation.
      </Empty>
    );
  }

  return <InterviewRunner interview={person} onClose={() => router.push("/my-work")} />;
}
