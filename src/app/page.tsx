import { Button } from "@/components/ui/button";
export default function Home() {

  return (
    <div className="flex gap-4">
      <Button variant="primary" size="lg">Mark</Button>

      <input type="text" placeholder="Search" />
      <Button variant="destructive">Mark</Button>
      <Button variant="outline">Mark</Button>
      <Button variant="secondary">Mark</Button>
      <Button variant="ghost">Mark</Button>
      <Button variant="muted">Mark</Button>
      <Button variant="tertiary">Mark</Button>
    </div>

  );
}
