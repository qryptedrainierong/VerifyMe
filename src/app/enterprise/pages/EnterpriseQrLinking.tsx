import { BookOpen, ExternalLink, Key, QrCode, Smartphone, Upload } from "lucide-react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { enterpriseQrKeyRow, enterpriseOrganization } from "../data/enterpriseSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

export function EnterpriseQrLinking() {
  return (
    <PortalPageFrame
      title="QR linking"
      description="How your organization issues QR codes and deep links so customer records connect to VerifyMe users—without exposing private keys in this portal."
      bodyClassName="max-w-5xl space-y-8"
    >
      <Card className="p-6 border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          <h2 className="text-[18px] font-semibold text-foreground">How linking works</h2>
        </div>
        <ul className="text-[14px] text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
          <li>
            Your organization generates QR or invite links from a customer account page in your app or via the VerifyMe
            APIs.
          </li>
          <li>
            Each QR or deep link carries <strong className="text-foreground">client_id</strong> and an{" "}
            <strong className="text-foreground">encrypted payload</strong> that includes your{" "}
            <strong className="text-foreground">client_user_id</strong> for that customer.
          </li>
          <li>
            <strong className="text-foreground">VerifyMe public key</strong> — your systems use it to encrypt payload
            material intended for VerifyMe.
          </li>
          <li>
            <strong className="text-foreground">Organization public key</strong> — VerifyMe uses it to verify signatures
            your systems produce. Private keys never appear here.
          </li>
        </ul>
      </Card>

      <Card className="p-6 border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <h2 className="text-[18px] font-semibold text-foreground">End-user experience (deep link / QR)</h2>
        </div>
        <ul className="text-[14px] text-muted-foreground space-y-2 list-disc list-inside">
          <li>
            <strong className="text-foreground">App installed</strong> — link opens the VerifyMe app to continue verification
            or linking.
          </li>
          <li>
            <strong className="text-foreground">App not installed</strong> — user is guided to install the app, then
            continues the same flow.
          </li>
          <li>
            <strong className="text-foreground">No VerifyMe account yet</strong> — user can sign up, then complete linking
            to your client_user_id.
          </li>
        </ul>
      </Card>

      <Card className="p-6 border border-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-[18px] font-semibold text-foreground">Key status</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              View VerifyMe public key
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload organization public key
            </Button>
            <Button size="sm">
              <Key className="w-4 h-4 mr-2" />
              Rotate key
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://docs.verifyme.example/qr-linking" target="_blank" rel="noreferrer">
                <BookOpen className="w-4 h-4 mr-2" />
                QR docs
                <ExternalLink className="w-3 h-3 ml-1 inline opacity-70" />
              </a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border border-border p-4">
            <p className="text-[12px] text-muted-foreground mb-1">VerifyMe public key</p>
            <UnifiedBadge variant="integration" value={enterpriseQrKeyRow.verifyMePublicKeyStatus} />
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-[12px] text-muted-foreground mb-1">Organization public key</p>
            <UnifiedBadge
              variant="integration"
              value={enterpriseQrKeyRow.organizationPublicKeyStatus === "Missing" ? "Missing" : "Uploaded"}
            />
          </div>
        </div>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-accent/40 border-b border-border">
              <tr>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">key_id</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Algorithm</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Last rotated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 font-mono text-[12px]">{enterpriseQrKeyRow.keyId}</td>
                <td className="p-3 text-[13px] text-muted-foreground">{enterpriseQrKeyRow.algorithm}</td>
                <td className="p-3 text-muted-foreground">{enterpriseQrKeyRow.lastRotated}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[12px] text-muted-foreground">
        Sample organization: <span className="font-medium text-foreground">{enterpriseOrganization.organizationName}</span>
      </p>
    </PortalPageFrame>
  );
}
