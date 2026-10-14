import { PracticeView } from "@/components/practice-view";

export const metadata = { title: "Practice · Employee First" };

export default async function PracticePage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return <PracticeView taskId={taskId} />;
}
