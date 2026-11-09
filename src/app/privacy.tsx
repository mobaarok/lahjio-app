import { PolicyPage } from "@/components/PolicyPage";

export default function PrivacyScreen() {
  return (
    <PolicyPage
      subtitle="privacy.subtitle"
      sections={[
        ["privacy.collect", "privacy.collectText"],
        ["privacy.why", "privacy.whyText"],
        ["privacy.where", "privacy.whereText"],
        ["privacy.never", "privacy.neverText"],
        ["privacy.contact", "privacy.contactText"],
      ]}
    />
  );
}
