import Link from "next/link";

type Props = { text: string; href: string; linkText: string };

export default function AuthFooterLink({ text, href, linkText }: Props) {
  return (
    <p className="text-center text-sm text-text-secondary mt-6">
      {text}{" "}
      <Link
        href={href}
        className="text-accent-warm font-semibold hover:text-accent-warm-hover transition-colors no-underline"
      >
        {linkText}
      </Link>
    </p>
  );
}
