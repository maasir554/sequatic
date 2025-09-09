"use client"

import { useState, useEffect, useRef } from "react"
import { motion, Variants } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

const mobileMenuVariants: Variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
    pointerEvents: "auto" as const,
  },
  closed: {
    y: "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
    pointerEvents: "none" as const,
  },
}

const mobileLinkVariants: Variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
}

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/landing' })
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isAtBottom =
        window.innerHeight + currentScrollY >=
        document.documentElement.scrollHeight - 10

      // Change background on scroll
      setScrolled(currentScrollY > 20)

      // Hide on scroll down, show on scroll up, and always hide at the bottom
      if (isAtBottom) {
        setIsVisible(false)
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, []) // Empty dependency array ensures this runs only on mount and unmount

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
          (scrolled || isMenuOpen)
            ? "bg-white/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent",
          isVisible || isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
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
                "font-black italic font-hero-heading text-blue-600 transition-all duration-300 ease-in-out",
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
                className="relative group text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 block h-0.5 w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {session.user.username || session.user.name || 'User'}
                  </span>
                </div>
                <Link href="/">
                  <Button variant="ghost" className="cursor-pointer text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="cursor-pointer text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="cursor-pointer text-gray-700 hover:bg-gray-100">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="cursor-pointer font-semibold px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
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
      <motion.div
        initial={false}
        animate={isMenuOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
        className={cn(
          "fixed inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-lg md:hidden"
        )}
      >
        <motion.div
          variants={mobileMenuVariants}
          className="flex flex-col items-center gap-8"
        >
          {navLinks.map((link) => (
            <motion.div key={link.label} variants={mobileLinkVariants}>
              <Link
                href={link.href}
                target={link.target}
                rel={
                  link.target === "_blank" ? "noopener noreferrer" : undefined
                }
                className="text-3xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          variants={mobileLinkVariants}
          className="absolute bottom-10 flex w-full flex-col items-center gap-4 px-6"
        >
          {session?.user ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="text-lg font-medium">
                  {session.user.username || session.user.name || 'User'}
                </span>
              </div>
              <Link href="/" className="w-full">
                <Button variant="ghost" className="w-full text-xl py-6" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-xl py-6 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full text-xl py-6" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <button
                  className="font-semibold px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full text-xl py-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}