import { PolicyPage } from "@/components/PolicyPage";

export default function TermsScreen() {
  return (
    <PolicyPage
      subtitle="terms.subtitle"
      sections={[
        ["terms.use", "terms.useText"],
        ["terms.content", "terms.contentText"],
        ["terms.account", "terms.accountText"],
        ["terms.free", "terms.freeText"],
        ["terms.changes", "terms.changesText"],
        ["terms.contact", "terms.contactText"],
      ]}
    />
  );
}
