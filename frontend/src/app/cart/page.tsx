// Server wrapper for the client cart component.
// Export `dynamic` to force dynamic rendering and avoid prerendering errors
// caused by client-only hooks like `useSearchParams` during SSG.
export const dynamic = 'force-dynamic';

import CartClient from './CartClient';

export default function Page() {
  return <CartClient />;
}
