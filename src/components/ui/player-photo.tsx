import Image from "next/image";

type PlayerPhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "size-10 text-xs",
  md: "size-14 text-sm",
  lg: "size-20 text-lg",
  xl: "size-32 text-3xl",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function PlayerPhoto({ name, photoUrl, size = "md", className = "" }: PlayerPhotoProps) {
  const classes = [
    "shrink-0 overflow-hidden rounded-full border border-white/10 bg-neutral-800 ring-2 ring-neutral-950",
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (photoUrl) {
    if (photoUrl.startsWith("blob:") || photoUrl.startsWith("data:")) {
      return (
        <span className={`${classes} relative block`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt={`Foto de ${name}`} className="h-full w-full object-cover" />
        </span>
      );
    }

    return (
      <span className={`${classes} relative block`}>
        <Image
          src={photoUrl}
          alt={`Foto de ${name}`}
          fill
          sizes="128px"
          className="object-cover"
          unoptimized
        />
      </span>
    );
  }

  return (
    <div className={`${classes} grid place-items-center bg-emerald-500/10 font-semibold text-emerald-200`}>
      {getInitials(name) || "?"}
    </div>
  );
}
