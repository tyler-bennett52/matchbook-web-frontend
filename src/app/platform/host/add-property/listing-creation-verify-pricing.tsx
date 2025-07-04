import React from "react";
import { Input } from "@/components/ui/input";
import { BrandCheckbox } from "@/app/brandCheckbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListingCreationCounter } from "./listing-creation-counter";
import { MonthlyPricing } from "./listing-creation-pricing";
import { styles } from "./styles";

interface ListingCreationVerifyPricingProps {
  shortestStay: number;
  longestStay: number;
  monthlyPricing: MonthlyPricing[];
  includeUtilities: boolean;
  utilitiesUpToMonths: number;
  onShortestStayChange: (value: number) => void;
  onLongestStayChange: (value: number) => void;
  onMonthlyPricingChange: (pricing: MonthlyPricing[]) => void;
}

const ListingCreationVerifyPricing: React.FC<ListingCreationVerifyPricingProps> = ({
  shortestStay,
  longestStay,
  monthlyPricing,
  includeUtilities,
  utilitiesUpToMonths,
  onShortestStayChange,
  onLongestStayChange,
  onMonthlyPricingChange
}) => {

  // Handlers for increasing/decreasing stay lengths
  const increaseShortestStay = () => {
    if (shortestStay < longestStay) {
      const newShortestStay = shortestStay + 1;
      onShortestStayChange(newShortestStay);
      updatePricingRange(newShortestStay, longestStay);
    }
  };

  const decreaseShortestStay = () => {
    if (shortestStay > 1) {
      const newShortestStay = shortestStay - 1;
      onShortestStayChange(newShortestStay);
      updatePricingRange(newShortestStay, longestStay);
    }
  };

  const increaseLongestStay = () => {
    if (longestStay < 12) {
      const newLongestStay = longestStay + 1;
      onLongestStayChange(newLongestStay);
      updatePricingRange(shortestStay, newLongestStay);
    }
  };

  const decreaseLongestStay = () => {
    if (longestStay > shortestStay) {
      const newLongestStay = longestStay - 1;
      onLongestStayChange(newLongestStay);
      updatePricingRange(shortestStay, newLongestStay);
    }
  };

  // Update pricing array when stay lengths change
  const updatePricingRange = (newShortestStay: number, newLongestStay: number) => {
    const newPricing: MonthlyPricing[] = [];
    for (let i = newShortestStay; i <= newLongestStay; i++) {
      // Try to find existing pricing for this month
      const existing = monthlyPricing.find(p => p.months === i);
      if (existing) {
        newPricing.push(existing);
      } else {
        // Create new entry with default values
        newPricing.push({
          months: i,
          price: '',
          utilitiesIncluded: false
        });
      }
    }
    onMonthlyPricingChange(newPricing);
  };

  // Update a specific month's pricing
  const updateMonthPricing = (months: number, price: string) => {
    const updated = monthlyPricing.map(p => 
      p.months === months ? { ...p, price } : p
    );
    onMonthlyPricingChange(updated);
  };

  // Update a specific month's utilities included status
  const updateMonthUtilities = (months: number, utilitiesIncluded: boolean) => {
    // Check if all checkboxes are currently unchecked (false)
    const allUnchecked = monthlyPricing.every(p => !p.utilitiesIncluded);
    
    if (allUnchecked && utilitiesIncluded) {
      // First click when all are unchecked - check all months up to and including the clicked month
      const updated = monthlyPricing.map(p => ({
        ...p,
        utilitiesIncluded: p.months <= months
      }));
      onMonthlyPricingChange(updated);
    } else {
      // Normal behavior - just toggle the clicked checkbox
      const updated = monthlyPricing.map(p => 
        p.months === months ? { ...p, utilitiesIncluded } : p
      );
      onMonthlyPricingChange(updated);
    }
  };

  return (
    <div className="relative w-full max-w-[886px]">
      <div className="w-full">

        {/* Interactive Controls - Allow editing stay lengths */}
        <div className="flex items-center justify-center w-full gap-8 mb-6">
          {/* Shortest Stay Controls */}
          <div className="flex items-center gap-3">
            <label className={`${styles.labelTextSmall} whitespace-nowrap`}>
              Shortest stay:
            </label>
            <ListingCreationCounter
              value={shortestStay}
              onChange={onShortestStayChange}
              onIncrement={increaseShortestStay}
              onDecrement={decreaseShortestStay}
              incrementDisabled={shortestStay >= longestStay}
              decrementDisabled={shortestStay <= 1}
              variant="outline"
              iconSize="sm"
              containerClassName="flex items-center space-x-1"
              buttonClassName={styles.counterButtonSmall}
              textClassName={`${styles.counterTextSmall} min-w-[20px]`}
              showMonthSuffix={true}
            />
          </div>

          {/* Longest Stay Controls */}
          <div className="flex items-center gap-3">
            <label className={`${styles.labelTextSmall} whitespace-nowrap`}>
              Longest stay:
            </label>
            <ListingCreationCounter
              value={longestStay}
              onChange={onLongestStayChange}
              onIncrement={increaseLongestStay}
              onDecrement={decreaseLongestStay}
              incrementDisabled={longestStay >= 12}
              decrementDisabled={longestStay <= shortestStay}
              variant="outline"
              iconSize="sm"
              containerClassName="flex items-center space-x-1"
              buttonClassName={styles.counterButtonSmall}
              textClassName={`${styles.counterTextSmall} min-w-[20px]`}
              showMonthSuffix={true}
            />
          </div>
        </div>

        {/* Pricing Table */}
        <div className="mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-[#e7f0f0] font-medium text-xs text-[#475467] w-[120px]">
                  Lease Length
                </TableHead>
                <TableHead className="bg-[#e7f0f0] font-medium text-xs text-[#475467] w-[140px]">
                  Monthly Rent
                </TableHead>
                <TableHead className="bg-[#e7f0f0] font-medium text-xs text-[#475467] w-[80px]">
                  Utilities Included
                </TableHead>
                <TableHead className="bg-[#e7f0f0] font-medium text-xs text-[#475467] w-[120px]">
                  Lease Length
                </TableHead>
                <TableHead className="bg-[#e7f0f0] font-medium text-xs text-[#475467] w-[140px]">
                  Monthly Rent
                </TableHead>
                <TableHead className="bg-[#e7f0f0] font-medium text-xs text-[#475467] w-[80px]">
                  Utilities Included
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: Math.ceil(monthlyPricing.length / 2) }, (_, rowIndex) => {
                const halfLength = Math.ceil(monthlyPricing.length / 2);
                const leftPricing = monthlyPricing[rowIndex];
                const rightPricing = monthlyPricing[rowIndex + halfLength];
                
                return (
                  <TableRow key={`pricing-row-${rowIndex}`}>
                    <TableCell className="py-4 text-sm text-[#373940] whitespace-nowrap">
                      {leftPricing.months} month{leftPricing.months !== 1 && 's'}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                        <Input
                          className="pl-7 text-xs"
                          placeholder="0.00"
                          value={leftPricing.price}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            updateMonthPricing(leftPricing.months, value);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <BrandCheckbox
                        name={`utilities-${leftPricing.months}`}
                        checked={leftPricing.utilitiesIncluded}
                        onChange={(e) => 
                          updateMonthUtilities(leftPricing.months, e.target.checked)
                        }
                      />
                    </TableCell>
                    {rightPricing ? (
                      <>
                        <TableCell className="py-4 text-sm text-[#373940] whitespace-nowrap">
                          {rightPricing.months} month{rightPricing.months !== 1 && 's'}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                            <Input
                              className="pl-7 text-xs"
                              placeholder="0.00"
                              value={rightPricing.price}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                updateMonthPricing(rightPricing.months, value);
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <BrandCheckbox
                            name={`utilities-${rightPricing.months}`}
                            checked={rightPricing.utilitiesIncluded}
                            onChange={(e) => 
                              updateMonthUtilities(rightPricing.months, e.target.checked)
                            }
                          />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ListingCreationVerifyPricing;
