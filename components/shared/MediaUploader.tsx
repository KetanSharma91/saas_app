"use client";

import React from 'react'
import { CldImage, CldUploadWidget } from 'next-cloudinary'
import { toast } from 'sonner';
import Image from 'next/image';
import { dataUrl, getImageSize } from '@/lib/utils';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';

type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    setImage: React.Dispatch<any>;
    publicId: string;
    image: any;
    type: string;
}

const MediaUploader = ({
    onValueChange,
    setImage,
    image,
    publicId,
    type
}: MediaUploaderProps) => {

    const onUploadSuccessHandler = (result: any) => {

        setImage((prevState: any) => ({
            ...prevState,
            publicId: result?.info?.public_id,
            width: result?.info?.width,
            height: result?.info?.height,
            secureURL: result?.info?.secure_url,
        }))

        onValueChange(result?.info?.public_id)

        toast(
            <div className='success-toast p-2'>
                <p className="font-semibold">Image uploaded successfully</p>
                <p className="text-muted-foreground">1 credit was deducted from your account</p>
            </div>,
            {
                duration: 5000
            }
        );
    }

    const onUploadErrorHandler = () => {
        toast(
            <div className='error-toast p-2'>
                <p className="font-semibold">Something went wrong while uploading</p>
                <p className="text-muted-foreground">Please try again</p>
            </div>,
            {
                duration: 5000
            }
        );
    }

    return (
        <CldUploadWidget
            uploadPreset="saas_app"
            options={{
                multiple: false,
                resourceType: "image"
            }}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
            {({ open }) => (
                <div className="flex flex-col gap-4">
                    <h3 className='h3-bold text-dark-600'>
                        Original
                    </h3>

                    {publicId ? <div className='cursor-pointer overflow-hidden rounded-[10px]'>
                        <CldImage
                            width={getImageSize(type, image, "width")}
                            height={getImageSize(type, image, "height")}
                            src={publicId}
                            alt='image'
                            sizes={"(max-width: 767px) 100vw ,50vw"}
                            placeholder={dataUrl as PlaceholderValue}
                            className='media-uploader_cldImage'
                        />

                    </div> :
                        <div className='media-uploader_cta' onClick={() => open()}>
                            <div className="media-uploader_cta-image">
                                <Image
                                    src="/assets/icons/add.svg"
                                    alt='Add Image'
                                    width={24}
                                    height={24} />
                            </div>
                            <p className="p-14-medium">Click here to upload image</p>
                        </div>
                    }
                </div>
            )}

        </CldUploadWidget>
    )
}

export default MediaUploader