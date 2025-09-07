import {
  ArrowDown,
  BarChart3,
  BrainCircuit,
  Database,
  Play,
  Sparkles,
  User,
  Zap,
} from "lucide-react"
import { Code } from "bright"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { WavyBackground } from "./ui/wavy-background"
import { Navbar } from "./Navbar"
import { BentoGridFeatures } from "./BentoGridFeatures"
import { ArchitectureDiagram } from "./ArchitectureDiagram"
import { TextGenerateEffect } from "./ui/text-generate-effect"
import Link from "next/link"
import Image from "next/image"

export const LandingPage = () => {
  return (
    <main>
      {/* Navigation */}
      <Navbar />

      <div className="min-h-screen relative overflow-hidden bg-white flex flex-col justify-center items-center pt-[88px]">
      {/* Hero Content */}
      <WavyBackground 
      backgroundFill={"white"}
      colors={["#f0b100", "white", "#658ef6"]}
      className="relative z-10 max-w-7xl mx-auto px-6 py-5 h-full flex flex-col justify-center my-[100px]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="md:space-y-8">
            <div className="md:space-y-6 mb-10">
              <h1 className="font-hero-heading leading-relaxed text-gray-900 text-balance mb-6 md:mb-8 lg:mb-10">
                <span className="text-3xl lg:text-4xl font-black italic text-blue-600">
                  Query your data with 
                </span>
                <br/>
                <span className="text-yellow-600 text-5xl lg:text-7xl font-extralight">Natural Language</span>
              </h1>
              <p className="text-sm md:text-md lg:text-lg text-gray-600 leading-relaxed text-pretty font-hero-para">
                Experience the future of SQL with {`Sequatic's`} in-browser playground. <br/>Create tables, run queries, and let AI
                transform your natural language into powerful SQL commands.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <RainbowButton 
                size={"lg"}
                variant={"hero"}
                className="cursor-pointer font-semibold text-md px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                      Start Querying Now
                </RainbowButton>
              
              <a href="#features" className="cursor-pointer bg-transparent rounded-lg text-blue-500 hover:bg-gray-50 font-semibold text-lg px-6 py-2 flex gap-2 justify-center items-center ">
                <ArrowDown className="w-5 h-5 mr-2" />
                Learn More
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Real-time Results</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Database className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">In-Browser SQLite</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative w-full">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/60 to-pink-400/60 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/60 to-purple-400/60 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-br from-pink-400/60 to-blue-400/60 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>

            {/* SQL Query Card */}
            <div className="bg-black/80 drop-shadow-2xl backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 relative z-10 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-gray-400">SQL Playground</span>
                <div className="w-12"></div>
              </div>

              <div className="flex bg-gray-900/50 p-1 gap-1 rounded-lg mb-4">
                <button className="cursor-pointer w-1/2 rounded-md py-1 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-700/50">
                  Agentic
                </button>
                <button className="cursor-pointer w-1/2 rounded-md py-1 text-sm font-medium bg-gray-700 text-white">
                  Ask
                </button>
              </div>

              <div className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end items-start gap-3">
                  <div className="flex-1 min-w-0 text-right">
                    <div className="bg-gray-900 rounded-lg p-3 inline-block">
                      <p className="text-white font-medium text-left">{`Show me all users who signed up last month`}</p>
                    </div>
                  </div>
                  <div className="flex flex-col w-6 h-12 gap-1 justify-center items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-xs mb-1">You</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="grid grid-cols-[2rem_1fr] items-start gap-3">
                  
                  <div className="w-6 h-12 flex flex-col justify-center items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500/50 flex items-center justify-center flex-shrink-0">
                      <BrainCircuit className="w-4 h-4 text-blue-300" />
                    </div>
                    <p className="text-gray-400 text-xs mb-1 font-semibold">AI</p>
                  </div>
                  
                  <div className="min-w-0">
                    <div className="bg-gray-900 rounded-lg p-3 font-mono">
                      <Code className="text-xs" lang="sql" theme={`github-dark`}>
                        {`SELECT * FROM users\nWHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`}
                      </Code>
                      <div className="mt-3 flex justify-end">
                        <button className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-md text-xs hover:bg-green-500/30 active:scale-95 transition">
                          <Play className="w-3 h-3" />
                          Run Query
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl"></div>
          </div>
        </div>
      </WavyBackground>
       {/* Scroll Indicator */}
      <a href="#features" className="z-20 absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer">
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </a>
    </div>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <TextGenerateEffect words={"A Playground for Your Ideas"} className="text-3xl md:text-4xl lg:text-5xl font-hero-heading font-black text-blue-600 mb-4 sm:mb-6 md:mb-12"/>
            <p className="mt-4 text-sm lg:text-lg text-gray-600 max-w-3xl mx-auto text-balance">
              Sequatic is more than just a SQL editor.<br/> {`It's`} an interactive environment
              designed to bring your data-driven ideas to life.
            </p>
          </div>
          <BentoGridFeatures />
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            {/* <h2 className="text-3xl md:text-4xl lg:text-5xl font-hero-heading font-black text-blue-600"> */}
             <TextGenerateEffect words={"How It Works"} className="text-3xl md:text-4xl lg:text-5xl font-hero-heading font-black text-blue-600"/>
            {/* </h2> */}
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto text-balance">
              A glimpse into the architecture that powers Sequatic, enabling
              in-browser SQL and AI-driven queries.
            </p>
          </div>
          <ArchitectureDiagram />
          <p className="mt-8 max-w-4xl mx-auto text-balance text-center text-gray-600">
            Sequatic runs entirely in your browser, leveraging WebAssembly for a
            powerful SQLite instance. Your data is snapshotted to IndexedDB for
            persistence and recovery, with an option to sync to our secure cloud
            backend. The Agentic AI interacts directly with the in-browser database to fulfill your natural language requests.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

const Footer = () => {
  const footerLinks = [
    { href: "/Login", label: "Login" },
    { href: "/#features", label: "Features" },
    { href: "/#architecture", label: "Architecture" },
    {
      href: "https://github.com/maasir554/sequatic",
      label: "GitHub",
      target: "_blank",
    },
  ]

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative flex flex-col items-center justify-center mb-12">
          <Image
            src="/sequatic-monochrome-white.svg"
            alt="Sequatic Logo"
            width={150}
            height={150}
            className="mb-1 opacity-75"
          />
          <h2
            aria-hidden="true"
            className="italic pointer-events-none text-center text-8xl md:text-9xl lg:text-[180px] font-black select-none font-hero-heading bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent px-10 py-10"
          >
            Sequatic
          </h2>
        </div>

        <div className="flex justify-center items-center gap-6 md:gap-8 mb-12">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.target}
              rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://github.com/maasir554"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Mohammad Maasir
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-xs hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}