'use client';

import { useParams } from 'next/navigation';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { getTripLocationString } from '@/utils/trip-helpers';
import { useTripContext } from '@/contexts/trip-context-provider';

export default function DislikesPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { state: { trip } } = useTripContext();

  return (
    <div>
      <Breadcrumbs
        links={[
          { label: 'Trips', url: '/platform/trips' },
          { label: getTripLocationString(trip), url: `/platform/trips/${tripId}` },
          { label: 'Disliked Properties' }
        ]}
        className="mb-4"
      />
      <div className="p-4">
        <div className="text-sm text-gray-500">
          /trips/[tripId]/dislikes
        </div>
        <h1 className="text-2xl font-bold mt-4">Disliked Properties</h1>
      </div>
    </div>
  );
}