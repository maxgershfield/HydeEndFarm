export default function LogoIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hyde End Farm Vineyard"
      viewBox="0 0 32 32"
      {...props}
    >
      {/* Stylised grape cluster */}
      <circle cx="16" cy="10" r="4" fill="currentColor" />
      <circle cx="10" cy="16" r="3.5" fill="currentColor" opacity="0.92" />
      <circle cx="22" cy="16" r="3.5" fill="currentColor" opacity="0.92" />
      <circle cx="13" cy="23" r="3.2" fill="currentColor" opacity="0.85" />
      <circle cx="19" cy="23" r="3.2" fill="currentColor" opacity="0.85" />
      <path
        d="M16 4v4M14 4c0-1 1-2 2-2s2 1 2 2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
