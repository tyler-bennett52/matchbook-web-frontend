'use client'
import React from "react";
import '@/app/utils/animaStyles.css'
import MatchbookHeader from "@/components/marketing-landing-components/matchbook-header";
import Hero from "@/components/home-components/hero";
import AdCopy from "@/components/home-components/adCopy";
import MarketingList from "@/components/marketing-landing-components/marketing-list";
import RentEasyCopy from "@/components/marketing-landing-components/rent-easy-copy";
import Footer from "@/components/marketing-landing-components/footer";
import { ApartmentIcon, SingleHomeIcon } from "@/components/svgs/svg-components";

const rentMarketingItems = [
  {
    number: 1,
    title: "Find a place, all in one place.",
    description: "Sick of clicking through tabs? Us too. Here, you can find a place you love on a singular website, with verified landlords."
  },
  {
    number: 2,
    title: "Swipe to find your perfect match.",
    description: "Swipe through places that match your preferences, and match with landlords who like your renting history back! It's like online dating, but without a fear of commitment."
  },
  {
    number: 3,
    title: "One application, unlimited options.",
    description: "No more paying $50 fees just to be rejected; unless you're into that kind of thing? With Matchbook, you fill out one application, for FREE. That's it."
  },
  {
    number: 4,
    title: "Transparent pricing.",
    description: "Unlike those other renting websites (dare us to @ them?), what you see on the listing, is what you pay. We're not here to play games."
  },
  {
    number: 5,
    title: "Rate your landlord.",
    description: "Why do landlords get to call your references but you can't call theirs? Ring ring! Welcome to the future. You finally get to see what other renters thought of their stay."
  }
];


const listMarketingItems = [
  {
    number: 1,
    title: "Manage your place, all in once place.",
    description: "No more listing on 4 different sites with the hopes of finding a good tenant. ON Matchbook, list your property, match with renters, view applications, and manage your place all on a singular website."
  },
  {
    number: 2,
    title: "List for free.",
    description: "List your property for free and pay only after your first booking. The fee? Only 1.5% of the first month's rent."
  },
  {
    number: 3,
    title: "Connect with Matchbook Verified Tenants.",
    description: "Matchbook Verified tenants are pre-screened and ready to match! Matching with unverified tenants? Don't worry. Enjoy seamless in-app screening."
  },
  {
    number: 4,
    title: "Rent automatically collected.",
    description: "No more sending awkward texts. Rent is automatically collected each month from your tenant's bank and transferred to yours, at no cost."
  },
  {
    number: 5,
    title: "Transform your business.",
    description: "With Matchbook, you have access to data-driven Property Insights. See how your property is performing in your dedicated analytics dashboard."
  }
];

const WebHomePage = () => {
  return (
    <>
      <MatchbookHeader />
      <Hero />
      <div className="scale-75 mb-12">
        <AdCopy />
      </div>
      <MarketingList title="Looking to rent?" Icon={ApartmentIcon} marketingItems={rentMarketingItems} brandColor="primary" />
      <RentEasyCopy />
      <MarketingList title="Looking to list?" Icon={SingleHomeIcon} marketingItems={rentMarketingItems} brandColor="secondary" />
      <Footer />
    </>
  );
};

export default WebHomePage;