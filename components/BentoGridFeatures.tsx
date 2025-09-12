"use client"
import { cn } from "@/lib/utils"
import React, { useRef } from "react"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import {
  Bot,
  BrainCircuit,
  CloudUpload,
  Database,
  DatabaseZap,
} from "lucide-react"

import { motion, type Variants } from "framer-motion"
import AILoadingState from "./kokonutui/ai-loading"

export function BentoGridFeatures() {
  return (
    <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn("[&>p:text-lg]", item.className)}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  )
}

const SkeletonOne = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const conversationVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.4,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  const terminalVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2, // After conversation
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const codeLineVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 1.5 + i * 0.2,
        duration: 0.3,
      },
    }),
  };

  const conversation = [
    { role: "user", text: "Show me all users who signed up last month" },
    { role: "ai", text: "Of course! I ran the query and here is the table result:" },
    { role: "user", text: "Add 2 packets of pasta to groceries" },
    { role: "ai", text: "Done. I have updated the table to add 2 packets of pasta to the groceries column" },
    { role: "user", text: "Update the pasta quantity to 5" },
    { role: "ai", text: "Alright, the quantity has been changed to 5!"},

  ];

  const sqlQuery = [
    "SELECT * FROM users",
    "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH);",
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="flex flex-col md:flex-row flex-1 w-full h-full min-h-[6rem] gap-4"
    >
      {/* Conversation Side */}
      <div 
      ref={scrollContainerRef}
        className="flex flex-col w-full lg:w-1/2 space-y-2 overflow-y-auto min-h-0 pr-2"
      >
        {conversation.map((msg, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={conversationVariants}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            onAnimationComplete={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                  top: scrollContainerRef.current.scrollHeight,
                  behavior: "smooth",
                });
              }
            }}
          >
            <div
              className={`rounded-lg p-2 max-w-[80%] text-xs ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terminal Side */}
      <motion.div
        variants={terminalVariants}
        className="w-full lg:w-1/2 bg-black rounded-lg border border-neutral-700/50 overflow-hidden h-auto flex flex-col"
      >
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/50 border-b border-neutral-700/50">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
        </div>
        <div className="p-3 font-mono text-xs text-green-400 flex-1">
          {sqlQuery.map((line, i) => (
            <motion.p key={i} custom={i} variants={codeLineVariants}>
              {line}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
const SkeletonTwo = () => {
  return (
    <div
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] items-center justify-center"
    >
      <AILoadingState />
    </div>
  )
}
const SkeletonThree = () => {
  const tableData = [
    { name: "Kathryn Campbell", email: "kathryn@apple.com", balance: "$5,143.03" },
    { name: "Robert Smith", email: "robert@openai.com", balance: "$4,321.87" },
    { name: "Sophia Johnson", email: "sophia@meta.com", balance: "$7,654.98" },
    { name: "Lucas Walker", email: "lucas@tesla.com", balance: "$3,456.45" },
    { name: "Emily Davis", email: "emily@sap.com", balance: "$9,876.54" },
  ];

  const variants = {
    initial: {
      y: 10,
      opacity: 0,
    },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.2,
      },
    }),
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full bg-white dark:bg-black/[0.8] rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-10 gap-2 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-gray-50 dark:bg-black/20">
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 col-span-4">Name</p>
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 col-span-4">Email</p>
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 col-span-2 text-right">Balance</p>
      </div>
      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        {tableData.map((row, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={variants}
            className="grid grid-cols-10 gap-2 px-4 py-3 border-b border-neutral-200/50 dark:border-neutral-800/50 last:border-b-0"
          >
            <p className="text-xs text-neutral-800 dark:text-neutral-200 truncate col-span-4">{row.name}</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate col-span-4">{row.email}</p>
            <p className="text-xs text-green-600 dark:text-green-400 font-mono text-right col-span-2">{row.balance}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  }
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  }
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Load CSV
        </p>
        <p className="border border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Input
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Analyze & Create Table
        </p>
        <p className="border border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Process
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Query Data
        </p>
        <p className="border border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Output
        </p>
      </motion.div>
    </motion.div>
  )
}
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  }
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-start space-x-2 bg-white dark:bg-black"
      >
        <div className="rounded-full h-10 w-10 bg-blue-200 flex items-center justify-center">
          <CloudUpload className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-xs text-neutral-500">
          Syncing database snapshot...
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
      >
        <p className="text-xs text-neutral-500">History saved.</p>
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shrink-0" />
      </motion.div>
    </motion.div>
  )
}
const items = [
  {
    title: (
      <h3 className="text-yellow-600 font-playfair text-3xl font-extrabold">
        AI-Powered Queries
      </h3>
    ),
    description: (
      <span className="text-sm">
        Leverage AI to translate natural language into precise, ready-to-run queries.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-2",
    icon: <BrainCircuit className="h-4 w-4 text-yellow-500" />,
  },
  {
    title: (
      <h3 className="text-blue-600 font-playfair text-3xl font-extrabold">
        {`Create & Update Tables`}
      </h3>
    ),
    description: (
      <span className="text-sm">
        Effortlessly design and modify your database schema with an intuitive interface.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <DatabaseZap className="h-4 w-4 text-blue-500" />,
  },
  {
    title: (
      <h3 className="text-blue-600 font-playfair text-3xl font-extrabold">
        Agentic Queries
      </h3>
    ),
    description: (
      <span className="text-sm">
        Let the AI agent retrieve data and manage tables by referencing CSV
        files.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-1",
    icon: <Bot className="h-4 w-4 text-blue-500" />,
  },
  {
    title: (
      <h3 className="text-yellow-600 font-playfair text-3xl font-extrabold">
        Interactive Data Tables
      </h3>
    ),
    description: (
      <span className="text-sm">
        View and interact with your data in a clean, responsive table, right in your browser.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <Database className="h-4 w-4 text-yellow-500" />,
  },
  {
    title: (
      <h3 className="text-blue-600 font-playfair text-3xl font-extrabold">
        Cloud Sync & Backup
      </h3>
    ),
    description: (
      <span className="text-sm">
        Automatically sync your database snapshots and chat history to the cloud.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <CloudUpload className="h-4 w-4 text-blue-500" />,
  },
]