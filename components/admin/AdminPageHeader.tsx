import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({ eyebrow, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="min-w-0">
        <p className="admin-page-eyebrow">{eyebrow}</p>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-description">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
