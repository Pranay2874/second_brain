export function CrossIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5" // Fixed: Changed stroke-width → strokeWidth
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round" // Fixed: Changed stroke-linecap → strokeLinecap
        strokeLinejoin="round" // Fixed: Changed stroke-linejoin → strokeLinejoin
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}
