import React from 'react';
import { ListingImage } from "@prisma/client";
import ImageGrouping from '../image-grouping';
import { Button } from '@/components/ui/button';

interface ImageDragDropProps {
  listingImages: ListingImage[];
  setListingImages: React.Dispatch<React.SetStateAction<ListingImage[]>>;
  groupingCategories: string[];
  setGroupingCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageDragDrop: React.FC<ImageDragDropProps> = ({ listingImages, setListingImages, groupingCategories, setGroupingCategories }) => {
  const [dragging, setDragging] = React.useState<ListingImage | null>(null);
  const [over, setOver] = React.useState({ img: '', activeHalf: '' });

  const handleDragStart = (img: ListingImage) => {
    setDragging(img);
  };

  const removeImgFromOldCategory = (draggedImage: ListingImage) => {
    let removedDraggedArray = listingImages.filter(img => img.id !== draggedImage.id);
    let oldCategoryArray = removedDraggedArray.filter(img => img.category === draggedImage.category);
    let restOfArray = listingImages.filter(img => img.category !== draggedImage.category);
    let sortedOldCategoryArray = oldCategoryArray.sort((a, b) => a.rank - b.rank);
    let updatedOldCategoryArray = sortedOldCategoryArray.map((img, idx) => {
      img.rank = idx + 1;
      return img;
    });
    let updatedArray = [...updatedOldCategoryArray, ...restOfArray];
    return updatedArray;
  };

  const insertToNewCategory = (arr: ListingImage[], newCategory: string, insertionRank: number) => {
    let newCategoryArray = arr.filter(img => img.category === newCategory);
    let restOfArray = arr.filter(img => img.category !== newCategory);
    let arrayWithSpaceAtRank = newCategoryArray.map((img: ListingImage, idx: number) => {
      if (img.rank >= insertionRank) {
        img.rank++;
      }
      return img;
    });

    let tempImage = { ...dragging };
    tempImage.rank = insertionRank;
    tempImage.category = newCategory;
    arrayWithSpaceAtRank.push(tempImage);

    let updatedArray = [...arrayWithSpaceAtRank, ...restOfArray];

    return updatedArray;
  };

  const handleDrop = (newCategory: string) => {
    if (!dragging) return;

    let insertionRank = 1; // Default rank for empty category

    if (over.img) {
      if (over.img.id === dragging.id && newCategory === dragging?.category) return;
      const overImage = over.img;
      const activeHalf = over.activeHalf;
      insertionRank = overImage.rank;

      if (over.img.id === dragging.id && newCategory !== dragging?.category) {
        insertionRank = listingImages.filter(img => img.category === newCategory).length + 1;
      }
      if (activeHalf === 'right' && over.img.id !== dragging.id) {
        insertionRank++;
      }
    } else {
      // If dropping into an empty category, set the rank to the next available position
      insertionRank = listingImages.filter(img => img.category === newCategory).length + 1;
    }

    setOver({ img: '', activeHalf: '' });
    let removedFromOldCategory = removeImgFromOldCategory(dragging);
    let insertedAtNewCategory = insertToNewCategory(removedFromOldCategory, newCategory, insertionRank);

    setListingImages(insertedAtNewCategory);
    setDragging(null);
  };

  const handleChangeCategory = (idx: number, newCategory: string) => {
    // Update the listingImages array
    setListingImages(prevImages => {
      return prevImages.map(img => {
        if (img.category === groupingCategories[idx]) {
          return { ...img, category: newCategory };
        }
        return img;
      });
    });

    // Update the groupingCategories array
    setGroupingCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[idx] = newCategory;
      return newCategories;
    });
  };

  return (
    <>
      <p>{dragging?.id}</p>
      <p>{over.img?.id}, {over.activeHalf}</p>
      {groupingCategories.map((category, idx) => (
        <ImageGrouping
          key={category}
          listingImages={listingImages.filter(img => img?.category === category)}
          onDragStart={handleDragStart}
          groupingCategory={category}
          handleDrop={handleDrop}
          over={over}
          setOver={setOver}
          dragging={dragging}
          setDragging={setDragging}
          handleChangeCategory={(newCategory: string) => handleChangeCategory(idx, newCategory)}
        />
      ))}
      <Button variant="ghost" onClick={() => setGroupingCategories([...groupingCategories, `Room ${groupingCategories.length + 1}`])}>Add Room</Button>
    </>
  );
};

export default ImageDragDrop;