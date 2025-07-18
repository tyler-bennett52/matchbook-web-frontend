import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Star, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { ListingAndImages } from "@/types"
import { useState, useRef, useEffect } from 'react'
import { useTripContext } from '@/contexts/trip-context-provider'
import { RejectIcon } from '@/components/svgs/svg-components'
import { useListingHoverStore } from '@/store/listing-hover-store'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ArrowLeft, ArrowRight, QuestionMarkIcon } from '@/components/icons'
import { ListingStatus } from '@/constants/enums'

const TITLE_MAX_LENGTH = 40

interface SearchListingCardProps {
  listing: ListingAndImages
  status: ListingStatus
  className?: string
  style?: React.CSSProperties
  detailsClassName?: string
  detailsStyle?: React.CSSProperties
  callToAction?: {
    label: string
    action: () => void
    className?: string
  }
  contextLabel?: {
    label: string
    action: () => void
    className?: string
  }
  customSnapshot?: any // Allow passing custom snapshot with overridden functions
}

export default function SearchListingCard({ 
  listing, 
  status, 
  className, 
  style, 
  detailsClassName, 
  detailsStyle, 
  callToAction, 
  contextLabel,
  customSnapshot 
}: SearchListingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const setHoveredListing = useListingHoverStore((state) => state.setHoveredListing)
  const router = useRouter()
  const { userId } = useAuth()
  const { state, actions } = useTripContext()
  let isFlexible = state.trip.flexibleStart || state.trip.flexibleEnd;

  // Create ref for the image container and state for dimensions
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (imageContainerRef.current) {
        setDimensions({
          width: imageContainerRef.current.clientWidth,
          height: imageContainerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Either use the custom snapshot passed in or fall back to the context
  const snapshot = customSnapshot || { 
    isLiked: (id: string) => state.lookup.favIds.has(id),
    isDisliked: (id: string) => state.lookup.dislikedIds.has(id),
    optimisticLike: actions.optimisticLike,
    optimisticDislike: actions.optimisticDislike,
    optimisticRemoveLike: actions.optimisticRemoveLike,
    optimisticRemoveDislike: actions.optimisticRemoveDislike
  };

  const getStatusStyles = (status: ListingStatus) => {
    if (snapshot.isLiked(listing.id)) {
      return 'bg-primaryBrand'
    } else if (snapshot.isDisliked(listing.id)) {
      return 'bg-pinkBrand'
    }

    switch (status) {
      case ListingStatus.Applied:
        return 'bg-primaryBrand'
      case ListingStatus.None:
      default:
        return 'bg-transparent hover:bg-white/60'
    }
  }

  const getStatusIcon = (status: ListingStatus) => {
    if (snapshot.isLiked(listing.id)) {
      return (
        <div
          className="bg-black/50 rounded-full p-2"
          onClick={(e: React.MouseEvent) => {
            snapshot.optimisticRemoveLike(listing.id);
            e.stopPropagation();
          }}
        >
          <Heart
            className="w-6 h-6 text-white cursor-pointer fill-red-500"
            strokeWidth={2}
          />
        </div>
      );
    } else if (snapshot.isDisliked(listing.id)) {
      return (
        <div
          className="bg-black/50 rounded-full "
          onClick={(e: React.MouseEvent) => {
            snapshot.optimisticRemoveDislike(listing.id);
            e.stopPropagation();
          }}
        >
          <RejectIcon
            className="w-9 h-9 text-white cursor-pointer p-2 "
          />
        </div>
      );
    }

    return (
      <div
        className="bg-black/50 rounded-full p-2"
        onClick={(e: React.MouseEvent) => {
          snapshot.optimisticLike(listing.id);
          e.stopPropagation();
        }}
      >
        <Heart
          className="w-6 h-6 text-white cursor-pointer"
          strokeWidth={2}
        />
      </div>
    );
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or carousel controls
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.carousel-controls')
    ) {
      return;
    }

    window.open(`/app/searches/${state.trip.id}/listing/${listing.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={`w-full overflow-hidden border-0 max-w-[600px] shadow-0 shadow-none cursor-pointer ${className || ''}`}
      style={style}
      onMouseEnter={() => {
        setIsHovered(true)
        setHoveredListing(listing)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoveredListing(null)
      }}
      onClick={handleCardClick}
    >
      <div ref={imageContainerRef} className="relative rounded-lg  mx-auto max-w-[600px] sm:aspect-[317/321]">
        <Carousel className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent>
            {listing.listingImages.map((image, index) => (
              <CarouselItem key={index} className="relative">
                <div className="aspect-[450/320] sm:aspect-[317/321] relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={`${listing.title} - Image ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                    sizes="(max-width: 267px) 100vw, 267px"
                    priority={index === 0}
                    unoptimized
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <CarouselPrevious Icon={ArrowLeft} className="left-2 text-white border-none hover:text-white bg-black/40 hover:bg-black/20 pl-[4px] " />
            <CarouselNext Icon={ArrowRight} className="right-2 text-white border-none hover:text-white bg-black/40 hover:bg-black/20 pr-[4px] " />
          </div>
        </Carousel>

        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 z-10 transition-opacity duration-300 opacity-60`}>
          {getStatusIcon(status)}
        </div>

        {/* Conditional render context banner only */}
        {contextLabel && (
          <div className="absolute top-5 mx-auto flex justify-center  w-full">
            <button
              onClick={contextLabel.action}
              className={`w-4/5 py-2 px-4 text-center rounded-xl ${contextLabel.className || 'bg-white/60 hover:bg-white/80'}`}
            >
              {contextLabel.label}
            </button>
          </div>
        )}
      </div>

      <div
        className={`pt-1 flex flex-col text-[14px] sm:min-h-[80px] ${detailsClassName || ''}`}
        style={detailsStyle}
      >
        {/* Listing Title */}
        <div className="flex justify-between text-[14px]  font-medium gap-x-2 items-start">
          <h3 className="truncate whitespace-nowrap">
            {listing.title.length > TITLE_MAX_LENGTH
              ? `${listing.title.substring(0, TITLE_MAX_LENGTH)}...`
              : listing.title}
          </h3>
        </div>

        {/* Listing Category and Rating */}
        <div className='flex justify-between mt-2'>
          {`${listing.category === 'singleFamily' ? 'Home' :
            listing.category ? (listing.category.charAt(0).toUpperCase() + listing.category.slice(1).toLowerCase()) : 'Property'} in
            ${listing.locationString ? (listing.locationString.split(',').at(-2)?.trim() || listing.locationString) : 'Location'}`}
          <div className="flex items-center">
            <Star className="w-3 h-3 fill-charcoalBrand text-charcoalBrand" />
            <span className="">{(listing as any).rating ?? 4.9}</span>
          </div>
        </div>

        {/* Listing Price and beds */}
        <div className="flex items-center justify-between mt-2">
          <div className="">
            ${listing.price?.toLocaleString() || 2350}
            <span className=""> month</span>
          </div>
          <div className="">
            {listing.roomCount || 4} bds | {listing.bathroomCount || 2} ba
          </div>
        </div>
        {/* Show flexible dates if isFlexible is true */}
        {!!isFlexible && (
          <p className="text-sm  mt-1">
            Available {' '}
            {listing.availableStart?.toLocaleDateString('en-gb', {
              day: '2-digit',
              month: 'short'
            }) || state.trip.startDate?.toLocaleDateString('en-gb', {
              day: '2-digit',
              month: 'short'
            })} - {listing.availableEnd?.toLocaleDateString('en-gb', {
              day: '2-digit',
              month: 'short'
            }) || state.trip.endDate?.toLocaleDateString('en-gb', {
              day: '2-digit',
              month: 'short'
            })}
          </p>
        )}
      </div>

      {callToAction && (
        <div className=" pt-2 ">
          <button
            onClick={() => callToAction.action()}
            className={`w-full py-2 px-4 rounded-lg ${callToAction.className || 'bg-blueBrand/90 text-white hover:bg-blueBrand'}`}
          >
            {callToAction.label}
          </button>
        </div>
      )}

      {/* Display the image container's dimensions at the bottom of the card */}
      {/* <div className="text-center text-xs text-gray-500 pb-2">
        Dimensions: {dimensions.width}px x {dimensions.height}px
      </div> */}
    </Card>
  )
}