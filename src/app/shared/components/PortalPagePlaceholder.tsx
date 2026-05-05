import { Card } from "./ui/card";
import { PortalPageFrame } from "./PortalPageFrame";

export interface PortalPagePlaceholderSection {
  title: string;
  description: string;
}

interface PortalPagePlaceholderProps {
  title: string;
  description: string;
  sections: PortalPagePlaceholderSection[];
}

export function PortalPagePlaceholder({ title, description, sections }: PortalPagePlaceholderProps) {
  return (
    <PortalPageFrame title={title} description={description} bodyClassName="max-w-5xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="border border-border p-5 shadow-sm">
            <h2 className="text-[15px] font-semibold text-foreground mb-2">{section.title}</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{section.description}</p>
          </Card>
        ))}
      </div>

      <Card className="border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-[13px] text-muted-foreground">
          Design-time placeholder — backend integration will connect live VerifyMe data here.
        </p>
      </Card>
    </PortalPageFrame>
  );
}
