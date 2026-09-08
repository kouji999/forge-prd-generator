import { cn } from '@/lib/utils';

/**
 * Brand mark — geometric "F" icon + "FORGE" wordmark, all inline SVG/text
 * using currentColor so it adapts to the active theme.
 * `size` controls the icon; the wordmark scales with it.
 */
export function Logo({
  className,
  size = 28,
  showWordmark = true,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        className="shrink-0 select-none text-ink"
      >
        {/* Geometric anvil-F: vertical stem + two horizontal arms */}
        <path
          d="M5 3h14v4h-10v4h8v4h-8v6H5V3z"
          fill="currentColor"
        />
      </svg>
      {showWordmark && (
        <span
          className="font-heading font-bold tracking-tight text-ink"
          style={{ fontSize: Math.max(size * 0.62, 15) }}
        >
          FORGE
        </span>
      )}
    </span>
  );
}
