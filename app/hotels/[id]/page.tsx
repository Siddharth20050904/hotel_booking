import { HotelDetails } from "@/components/hotel-details"

export default function HotelDetailsPage({ params }: { params: { id: string } }) {
  return <HotelDetails hotelId={params.id} />
}
