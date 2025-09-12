"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { Archive, BrainCircuit, Database, Server, User } from "lucide-react"
import { WarpBackground } from "./magicui/warp-background"
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; title?: string }
>(({ className, children, title }, ref) => {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        ref={ref}
        className={cn(
          "z-10 flex flex-col gap-2 w-[70px] p-1 md:w-[100px] lg:w-auto aspect-square items-center justify-center rounded-full border-2 nd:border-blue-300 bg-white shadow-[0_0_20px_-12px_#155dfc]",
          className,
        )}
      >
        {children}
        {title && <p className="w-24 text-[10px] sm:text-xs md:text-sm text-gray-600">{title}</p>}
      </div>
    </div>
  )
})

Circle.displayName = "Circle"

export function ArchitectureDiagram({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const aiRef = useRef<HTMLDivElement>(null)
  const sqliteRef = useRef<HTMLDivElement>(null)
  const indexedDbRef = useRef<HTMLDivElement>(null)
  const mongoDbRef = useRef<HTMLDivElement>(null)

  return (
    <WarpBackground className="p-2 sm:p-4 md:p-10 lg:p-16">

    <div
      className={cn(
        "relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border bg-gray-50/50 backdrop-blur-3xl p-2md:p-10 overflow-x-auto",
        className,
      )}
      ref={containerRef}
      >
      <div className="flex h-full w-full flex-col items-center justify-between gap-4">

        <div className="flex w-full max-w-2xl flex-row items-center justify-around">
            {/* Middle: AI */}
            <Circle ref={aiRef} title="Agentic AI">
                <BrainCircuit className="size-4 md:size-6 lg:size-8 text-yellow-500" />
            </Circle>
            {/* Top: User */}
            <Circle ref={userRef} title="User">
                <User className="size-4 md:size-6 lg:size-8 text-gray-600" />
            </Circle>
        </div>

        {/* Bottom: Data Layer */}
        <div className="flex w-full  max-w-2xl flex-row items-center justify-around">
          <Circle ref={sqliteRef} title="In-Browser SQLite">
            <Database className="size-4 md:size-6 lg:size-8 text-green-500" />
          </Circle>
          <Circle ref={indexedDbRef} title="IndexedDB Snapshots">
            <Archive className="size-4 md:size-6 lg:size-8 text-purple-500" />
          </Circle>
          <Circle ref={mongoDbRef} title="Cloud Backup">
            <Server className="size-4 md:size-6 lg:size-8 text-gray-500" />
          </Circle>
        </div>
      </div>

      {/* Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={aiRef}
        toRef={sqliteRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={aiRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        
        />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sqliteRef}
        toRef={indexedDbRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={indexedDbRef}
        toRef={mongoDbRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={sqliteRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        
        />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={mongoDbRef}
        toRef={userRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        
        />

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={indexedDbRef}
        duration={4}
        gradientStartColor={"#155dfc"}
        gradientStopColor={"#d08700"}
        />
    </div>
        </WarpBackground>
  )
}