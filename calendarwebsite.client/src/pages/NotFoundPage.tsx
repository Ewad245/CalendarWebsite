import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-2">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">
          {t("error.pageNotFound", "Page Not Found")}
        </h2>
        <p className="text-muted-foreground">
          {t(
            "error.invalidUrl",
            "The page you are looking for doesn't exist or has been moved."
          )}
        </p>
        <Button asChild className="mt-8">
          <Link to="/">
            <HomeIcon className="mr-2" />
            {t("error.backToHome", "Back to Home")}
          </Link>
        </Button>
      </div>
    </div>
  );
}