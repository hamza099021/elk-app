"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedHeadingProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export default function AnimatedHeading({ 
  text, 
  className = "", 
  as: Component = "h2" 
}: AnimatedHeadingProps) {
  const [isVisible, setIsVisible] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headingRef.current) {
      observer.observe(headingRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const words = text.split(" ")

  return (
    <Component ref={headingRef} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-700 ${
            isVisible
              ? "opacity-100 blur-0 translate-y-0"
              : "opacity-0 blur-md -translate-y-8"
          }`}
          style={{
            transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
          }}
        >
          {word}
          {index < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </Component>
  )
}
