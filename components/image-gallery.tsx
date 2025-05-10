"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  alt?: string
}

export function ImageGallery({ images, alt = "Blog image" }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (images.length === 0) {
    return null
  }

  if (images.length === 1) {
    return (
      <div className="relative cursor-pointer overflow-hidden rounded-lg" onClick={toggleFullscreen}>
        <img src={images[0] || "/placeholder.svg"} alt={alt} className="w-full h-auto object-cover rounded-lg" />

        {isFullscreen && (
          <FullscreenView
            images={images}
            currentIndex={0}
            onClose={toggleFullscreen}
            onNext={() => {}}
            onPrev={() => {}}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative cursor-pointer overflow-hidden rounded-lg" onClick={toggleFullscreen}>
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={alt}
          className="w-full h-[400px] object-cover rounded-lg"
        />

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
          onClick={(e) => {
            e.stopPropagation()
            prevImage()
          }}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous image</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
          onClick={(e) => {
            e.stopPropagation()
            nextImage()
          }}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next image</span>
        </Button>
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto py-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "h-16 w-16 overflow-hidden rounded-md border-2 transition-all",
              currentIndex === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
            )}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {isFullscreen && (
        <FullscreenView
          images={images}
          currentIndex={currentIndex}
          onClose={toggleFullscreen}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  )
}

function FullscreenView({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background/90"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90"
                onClick={onPrev}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous image</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next image</span>
              </Button>
            </>
          )}

          <img
            src={images[currentIndex] || "/placeholder.svg"}
            alt="Fullscreen view"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
