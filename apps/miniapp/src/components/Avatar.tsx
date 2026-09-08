import "./Avatar.css";

interface AvatarProps {
  name: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function Avatar({ name }: AvatarProps) {
  return (
    <div className="avatar" aria-hidden="true">
      {getInitials(name)}
    </div>
  );
}
