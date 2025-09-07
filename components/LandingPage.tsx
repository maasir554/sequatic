import {
  ArrowDown,
  Sparkles,
  Zap,
  BarChart3,
  Database,
  DatabaseZap,
  BrainCircuit,
  CloudUpload,
} from "lucide-react"
import { Code } from "bright"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { WavyBackground } from "./ui/wavy-background"
import { Navbar } from "./Navbar"

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
                <span className="text-yellow-500 text-5xl lg:text-7xl font-extralight">Natural Language</span>
              </h1>
              <p className="text-sm md:text-md lg:text-lg text-gray-600 leading-relaxed text-pretty font-hero-para">
                Experience the future of SQL with {`Sequatic's`} in-browser playground. Create tables, run queries, and let AI
                transform your natural language into powerful SQL commands.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <RainbowButton 
                size={"lg"}
                className="cursor-pointer font-semibold text-md px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
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
            <div className="bg-black drop-shadow-2xl backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 relative z-10 text-xs sm:text-sm ">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="ml-2">SQL Playground</span>
                </div>

                <div className="space-y-3 flex flex-col">
                  <div className="bg-gray-800 rounded-lg p-3 flex flex-col w-full">
                    <p className="text-sm text-gray-400 mb-2">Natural Language:</p>
                    <p className="text-white font-medium">{`"Show me all users who signed up last month"`}</p>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <Sparkles className="w-5 h-5 animate-pulse text-yellow-500" />
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 font-mono max-w-full flex flex-col w-[calc(100vw-80px)] md:w-full">
                    <p className="text-gray-400 mb-2 w-full max-w-full">Generated SQL:</p>
                    
                    <Code className="flex w-full max-w-full overflow-auto" lang="sql" theme={`dracula`}>
                        {`SELECT * FROM users\nWHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`}
                    
                    </Code>
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
      <a href="#features" className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer">
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </a>
    </div>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-gray-50/70 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-hero-heading font-black text-blue-600">
              A Playground for Your Ideas
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto text-balance">
              Sequatic is more than just a SQL editor. {`It's`} an interactive
              environment designed to bring your data-driven ideas to life.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Create and update tables */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/50 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600">
                <DatabaseZap className="w-6 h-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold font-hero-heading text-yellow-600">
                Create & Update Tables
              </h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Effortlessly design and modify your database schema. Create
                tables, add columns, and update data types with an intuitive
                interface, all within your browser, Thanks to Web {`Assembly!`}
              </p>
            </div>
            {/* Feature 2: AI and Manual Queries */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/50 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-yellow-100 text-yellow-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold font-hero-heading text-yellow-600">
                AI-Powered Queries
              </h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Query your data your way. Use our powerful console for manual
                SQL, or leverage Agentic AI to translate natural language
                into precise, ready-to-run queries.
              </p>
            </div>
            {/* Feature 3: Cloud Sync */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/50 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-600">
                <CloudUpload className="w-6 h-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold font-hero-heading text-yellow-600">
                Cloud Sync & Backup
              </h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Keep your work safe and accessible. Sequatic automatically
                synchronizes your database snapshots and chat history to the
                cloud, ensuring you never lose progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-hero-heading font-black text-blue-600">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto text-balance">
              A glimpse into the architecture that powers Sequatic, enabling
              in-browser SQL and AI-driven queries.
            </p>
          </div>
          <div className="text-center text-gray-500 bg-gray-50 rounded-2xl p-16 border">
            <p className="text-xl font-medium">Architecture Diagram & Explanation Coming Soon!</p>
          </div>
        </div>
      </section>
    </main>
  )
}