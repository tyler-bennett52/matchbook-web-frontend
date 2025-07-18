"use client";

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { updateListing } from '@/app/actions/listings';
import { toast } from '@/components/ui/use-toast';
import { ListingAndImages } from '@/types';

interface ListingActiveSwitchProps {
  listing: ListingAndImages;
  onListingUpdate?: (updatedListing: ListingAndImages) => void;
}

export const ListingActiveSwitch: React.FC<ListingActiveSwitchProps> = ({ 
  listing, 
  onListingUpdate 
}) => {
  const [isActive, setIsActive] = useState(listing.markedActiveByUser || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    
    try {
      await updateListing(listing.id, { markedActiveByUser: checked });
      setIsActive(checked);
      
      // Update parent component if callback provided
      if (onListingUpdate) {
        const updatedListing = { ...listing, markedActiveByUser: checked };
        onListingUpdate(updatedListing);
      }
      
      toast({
        title: "Success",
        description: `Listing marked as ${checked ? 'active' : 'inactive'}`
      });
    } catch (error) {
      console.error('Error updating listing active status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if listing is approved
  const isApproved = listing.approvalStatus === 'approved';
  
  // If not approved, show status text instead of switch
  if (!isApproved) {
    const statusText = listing.approvalStatus === 'pending' || listing.approvalStatus === 'pendingReview' 
      ? 'Pending Approval' 
      : listing.approvalStatus === 'rejected' 
      ? 'Rejected' 
      : 'Pending Approval';
      
    const statusColor = listing.approvalStatus === 'rejected' 
      ? 'text-red-600' 
      : 'text-black';
      
    return (
      <div className="flex items-center space-x-3">
        <span className={`text-sm font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
    );
  }

  // For approved listings, show the switch
  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700">
        Listing {isActive ? 'Active' : 'Inactive'}
      </label>
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
    </div>
  );
};
