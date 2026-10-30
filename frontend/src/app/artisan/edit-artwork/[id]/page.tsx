// Server wrapper for the client page component
import EditArtworkClient from './EditArtworkClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params?: Promise<{ id?: string }> }) {
  const resolved = params ? await params : undefined;
  const id = resolved?.id ?? '';
  return <EditArtworkClient id={String(id)} />;
}
