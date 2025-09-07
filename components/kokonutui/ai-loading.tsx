"use client";

/**
 * @author: @kokonutui
 * @description: AI Loading State
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const TASK_SEQUENCES = [
	{
		status: "Connecting to Database",
		lines: [
			"Establishing secure connection...",
			"Authenticating credentials...",
			"Fetching database schema...",
			"Analyzing table structures...",
			"Mapping relationships...",
			"Connection successful.",
		],
	},
	{
		status: "Analyzing SQL Query",
		lines: [
			"Parsing SQL syntax...",
			"Validating query semantics...",
			"Generating execution plan...",
			"Estimating query cost...",
			"Identifying potential bottlenecks...",
			"Checking for indexing opportunities...",
			"Finalizing query analysis...",
		],
	},
	{
		status: "Optimizing & Executing Query",
		lines: [
			"Applying optimization rules...",
			"Rewriting query for performance...",
			"Executing optimized query...",
			"Fetching results from database...",
			"Processing result set...",
			"Formatting data for display...",
			"Preparing data visualization...",
			"Finalizing results...",
		],
	},
];

export default function AILoadingState() {
    const [sequenceIndex, setSequenceIndex] = useState(0);
    const [visibleLines, setVisibleLines] = useState<
        Array<{ text: string; number: number }>
    >([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const codeContainerRef = useRef<HTMLDivElement>(null);
    const lineHeight = 28;

    const currentSequence = TASK_SEQUENCES[sequenceIndex];
    const totalLines = currentSequence.lines.length;

    useEffect(() => {
        const initialLines = [];
        for (let i = 0; i < Math.min(5, totalLines); i++) {
            initialLines.push({
                text: currentSequence.lines[i],
                number: i + 1,
            });
        }
        setVisibleLines(initialLines);
        setScrollPosition(0);
    }, [sequenceIndex, currentSequence.lines, totalLines]);

    // Handle line advancement
    useEffect(() => {
        const advanceTimer = setInterval(() => {
            // Get the current first visible line index
            const firstVisibleLineIndex = Math.floor(
                scrollPosition / lineHeight
            );
            const nextLineIndex = (firstVisibleLineIndex + 3) % totalLines;

            // If we're about to wrap around, move to next sequence
            if (nextLineIndex < firstVisibleLineIndex && nextLineIndex !== 0) {
                setSequenceIndex(
                    (prevIndex) => (prevIndex + 1) % TASK_SEQUENCES.length
                );
                return;
            }

            // Add the next line if needed
            if (
                nextLineIndex >= visibleLines.length &&
                nextLineIndex < totalLines
            ) {
                setVisibleLines((prevLines) => [
                    ...prevLines,
                    {
                        text: currentSequence.lines[nextLineIndex],
                        number: nextLineIndex + 1,
                    },
                ]);
            }

            // Scroll to the next line
            setScrollPosition((prevPosition) => prevPosition + lineHeight);
        }, 2000); // Slightly slower than the example for better readability

        return () => clearInterval(advanceTimer);
    }, [
        scrollPosition,
        visibleLines,
        totalLines,
        sequenceIndex,
        currentSequence.lines,
        lineHeight,
    ]);

    // Apply scroll position
    useEffect(() => {
        if (codeContainerRef.current) {
            codeContainerRef.current.scrollTop = scrollPosition;
        }
    }, [scrollPosition]);

    return (
        <div className="flex items-center justify-center min-h-full w-full">
            <div className="space-y-4 w-auto">
                <div className="ml-2 flex items-center space-x-2 text-gray-600 dark:text-gray-300 font-medium">
                    <div className="relative w-6 h-6">
                        <Image src={"/sequatic-detailed.svg"} width={30} height={30} alt="Sequatic" className="animate-spin delay-75 w-6 h-6" />
                    </div>
                    <span className="text-sm">{currentSequence.status}...</span>
                </div>

                <div className="relative">
                    <div
                        ref={codeContainerRef}
                        className="font-mono text-xs overflow-hidden w-full h-[84px] relative rounded-lg"
                        style={{ scrollBehavior: "smooth" }}
                    >
                        <div>
                            {visibleLines.map((line, index) => (
                                <div
                                    key={`${line.number}-${line.text}`}
                                    className="flex h-[28px] items-center px-2"
                                >
                                    <div className="text-gray-400 dark:text-gray-500 pr-3 select-none w-6 text-right">
                                        {line.number}
                                    </div>

                                    <div className="text-gray-800 dark:text-gray-200 flex-1 ml-1">
                                        {line.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none rounded-lg from-white/90 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent"
                        style={{
                            background:
                                "linear-gradient(to bottom, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 30%, var(--tw-gradient-to) 100%)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
