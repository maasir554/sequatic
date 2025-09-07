"use client"
import { useEffect, useRef, useState } from "react"
import { motion, stagger, useAnimate } from "motion/react"
import { cn } from "@/lib/utils"

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string
  className?: string
  filter?: boolean
  duration?: number
}) => {
  const [scope, animate] = useAnimate()
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordsArray = words.split(" ")

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before fully in view
      },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible && scope.current) {
      // Reset all spans to initial state
      animate(
        "span",
        {
          opacity: 0,
          filter: filter ? "blur(10px)" : "none",
        },
        {
          duration: 0,
        },
      )

      // Then animate them in
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.2),
        },
      )
    } else if (!isVisible && scope.current) {
      // Reset to initial state when out of view
      animate(
        "span",
        {
          opacity: 0,
          filter: filter ? "blur(10px)" : "none",
        },
        {
          duration: 0,
        },
      )
    }
  }, [isVisible, scope.current, animate, filter, duration])

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div ref={containerRef}>
      <div className="mt-4">
        <div className={cn("font-bold dark:text-white text-black text-2xl leading-snug tracking-wide", className)}>
          {renderWords()}
        </div>
      </div>
    </div>
  )
}
