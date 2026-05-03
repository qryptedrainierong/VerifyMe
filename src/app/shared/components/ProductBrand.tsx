import logoImage from "../../../imports/image-0.png";

interface ProductBrandProps {
  variant?: "default" | "compact";
  showTagline?: boolean;
}

export function ProductBrand({ variant = "default", showTagline = false }: ProductBrandProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center">
        <img src={logoImage} alt="VerifyMe" className="h-7 w-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <img src={logoImage} alt="VerifyMe" className="h-10 w-auto" />
      {showTagline && (
        <p className="text-[12px] text-muted-foreground">
          Identity Verification Platform
        </p>
      )}
    </div>
  );
}
