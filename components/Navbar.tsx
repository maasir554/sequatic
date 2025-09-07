"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isMenuOpen])

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#architecture", label: "Architecture" },
    {
      href: "https://github.com/M-AASIR/sequatic",
      label: "GitHub",
      target: "_blank",
    },
  ]

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out",
          scrolled || isMenuOpen
            ? "bg-white/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        )}
      >
        <div
          className={cn(
            "max-w-7xl mx-auto flex items-center justify-between px-6 transition-all duration-300 ease-in-out",
            scrolled ? "py-2" : "py-6"
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/sequatic-detailed.svg"
              alt="Sequatic"
              width={40}
              height={40}
              className={cn(
                "transition-all duration-300 ease-in-out",
                scrolled ? "w-8 h-8" : "w-10 h-10"
              )}
            />
            <span
              className={cn(
                "font-extrabold italic font-hero-heading text-blue-600 transition-all duration-300 ease-in-out",
                scrolled ? "text-lg" : "text-xl"
              )}
            >
              Sequatic
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.target}
                rel={
                  link.target === "_blank" ? "noopener noreferrer" : undefined
                }
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
              Login
            </Button>
            <button className="font-semibold px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-lg transition-all duration-300 ease-in-out md:hidden",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="flex flex-col items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.target}
              rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
              className="text-2xl font-semibold text-gray-800 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="absolute bottom-10 flex w-full flex-col items-center gap-4 px-6">
          <Button
            variant="ghost"
            className="w-full text-xl py-6 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Button>
          <button
            className="w-full font-semibold text-xl px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </button>
        </div>
      </div>
    </>
  )
}