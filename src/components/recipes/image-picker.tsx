"use client";

import { useRef, useState } from "react";
import Image from "next/image.js";

interface ImagePickerProps {
  label: string;
  name: string;
  errors?: string[];
  currentImage?: string;
}

export default function ImagePicker({ label, name, errors, currentImage }: ImagePickerProps) {
  const imageInput = useRef<HTMLInputElement | null>(null);
  const [pickedImage, setPickedImage] = useState<string | null>(currentImage ?? null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPickedImage(null);
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setPickedImage(fileReader.result as string);
    };

    fileReader.readAsDataURL(file);
  };

  const handlePickClick = () => {
    imageInput.current?.click();
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 font-medium text-center text-white text-lg"
      >
        {label}
      </label>
      <div className="flex flex-col md:flex-row justify-start gap-6 mb-4">
        <div className="w-40 h-64 md:w-1/2 border-2 border-gray-400 flex justify-center items-center text-gray-400 relative mx-auto md:mx-0">
          {!pickedImage && (
            <p className="text-center p-4">No image picked yet</p>
          )}
          {pickedImage && (
            <Image
              src={pickedImage}
              alt="Uploaded image from user"
              fill
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full md:w-1/2 mt-4 md:mt-0">
          <input
            className="hidden"
            type="file"
            id={name}
            accept="image/png, image/jpeg"
            name={name}
            ref={imageInput}
            onChange={handleImageChange}
            required={!currentImage}
          />
          <button
            className="border-2 border-trinidad-500 py-2 px-4 md:mb-0 mb-4 rounded-md cursor-pointer bg-transparent text-trinidad-500 hover:bg-trinidad-500 hover:text-white focus:bg-trinidad-500 focus:text-white transition-colors duration-300"
            type="button"
            onClick={handlePickClick}
          >
            Pick an Image
          </button>
        </div>
      </div>
    </div>
  );
}
