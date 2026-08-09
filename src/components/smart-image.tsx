"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { useBuyerState } from "@/components/buyer-state";

interface SmartImageProps extends ImageProps {
  fallbackLabel?: string;
}

function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("w", String(width));
  return url.toString();
}

export function SmartImage({
  alt,
  fallbackLabel = "Image unavailable",
  loader,
  loading,
  priority,
  quality,
  src,
  unoptimized,
  ...props
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const { preferences } = useBuyerState();
  const source =
    retry > 0 && typeof src === "string" && src.startsWith("https://")
      ? `${src}${src.includes("?") ? "&" : "?"}sokoza_retry=${retry}`
      : src;
  const imageLoader = typeof source === "string" && source.startsWith("https://images.unsplash.com/")
    ? unsplashLoader
    : loader;
  const isSupabaseStorageImage = typeof source === "string"
    && source.startsWith("https://kzixedushlpthxehqoho.supabase.co/storage/v1/object/public/");

  if (failed || !source) {
    return (
      <div className={`image-fallback ${props.className ?? ""}`} role="img" aria-label={alt}>
        <Icon name="image" size={28} />
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      loader={imageLoader}
      loading={priority ? "eager" : loading}
      onError={() => {
        if (retry === 0) setRetry(1);
        else setFailed(true);
      }}
      preload={Boolean(priority)}
      quality={quality ?? (preferences.reducedData ? 55 : 75)}
      src={source}
      unoptimized={unoptimized ?? isSupabaseStorageImage}
      {...props}
    />
  );
}
