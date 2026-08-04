import { Workflow } from "lucide-react";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border border-sage/40 bg-paper-raised"
      style={{ width: size, height: size }}
    >
      <Workflow className="text-sage" size={Math.round(size * 0.5)} strokeWidth={1.75} />
    </div>
  );
}
