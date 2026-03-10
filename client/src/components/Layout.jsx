/**
 * Reusable page layout wrapper with consistent max-width and padding.
 */
export default function Layout({ children, className = '' }) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 ${className}`}>
      {children}
    </div>
  );
}
