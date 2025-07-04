import { HomeIcon } from "lucide-react";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Card, CardContent } from "../ui/card";

interface MarketingPageHeaderProps {
  headerText: string;
  highlightedText?: string;
  breadcrumbText?: string;
}

export const MarketingPageHeader = ({
  headerText,
  highlightedText,
  breadcrumbText,
}: MarketingPageHeaderProps): JSX.Element => {
  return (
    <Card className="w-[1143px] px-[100px] py-10 flex flex-col items-center justify-center gap-3 rounded-xl border border-[#d1d5da]">
      <CardContent className="p-0 flex flex-col items-center w-full">
        <div className="flex flex-col items-center">
          {highlightedText && (
            <p className="w-fit [font-family:'Lora',Helvetica] font-semibold text-[#0b6969] text-base text-center">
              {highlightedText}
            </p>
          )}
          <h1 className="w-fit font-[Lora] font-medium text-gray-neutral900 text-[56px] text-center tracking-[-2px] leading-[100%]">
            {headerText}
          </h1>
        </div>

        <Breadcrumb className="mt-3">
          <BreadcrumbList className="flex items-center gap-[15px]">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <HomeIcon className="w-6 h-6" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="font-text-md-regular text-gray-3500">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="[font-family:'Poppins',Helvetica] font-normal text-gray-3900 text-base leading-6">
                {breadcrumbText || headerText}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardContent>
    </Card>
  );
};