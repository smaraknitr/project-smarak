'use client';

import React, { ReactNode } from 'react';
import { ImageCard } from './image-card';
import { cn } from '@/lib/utils';

export interface SectionProps {
  title: string;
  content: ReactNode;
  image: {
    src: string;
    name: string;
    height?: number;
    width?: number;
  };
  direction?: 'left' | 'right';
  titleColor?: string;
}

export const HeaderTitle = ({
  title,
  titleColor = '#554400',
  className,
}: {
  title: string;
  titleColor?: string;
  className?: string;
}) => {
  return (
    <div className="inline-block mb-6 py-1">
      <h1 className={`text-5xl font-bold text-[${titleColor}] font-outfit`}>{title}</h1>
      <div className={cn(`absolute w-28 h-2 bg-[${titleColor}] mt-1`, className)}></div>
    </div>
  );
};

export function Section({
  title,
  content,
  image,
  direction = 'right',
  titleColor = '#554400',
}: SectionProps) {
  return (
    <div className={`px-8 py-8 relative my-10`}>
      <div className="max-w-7xl mx-auto">
        <HeaderTitle title={title} titleColor={titleColor} />

        <div className="flex flex-col md:flex-row gap-8 mt-5">
          {direction === 'right' ? (
            <div className="flex flex-col-reverse md:flex-row items-start justify-between w-full">
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="text-gray-800 leading-relaxed mb-6 font-outfit text-lg">
                  {content}
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <ImageCard
                  imgName={image.name}
                  imgSrc={image.src}
                  height={image.height || 350}
                  width={image.width || 400}
                />
              </div>
            </div>
          ) : (
            <div className=" flex flex-col md:flex-row items-start justify-between w-full ">
              <div className="">
                <ImageCard
                  imgName={image.name}
                  imgSrc={image.src}
                  height={image.height || 350}
                  width={image.width || 350}
                />
              </div>
              <div className="md:w-2/3 md:pl-20 mt-8">
                <div className="text-gray-800 leading-relaxed mb-6 font-outfit text-lg">
                  {content}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
