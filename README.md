# PESU Forge

![React](https://img.shields.io/badge/React-18-000000?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Framework-000000?style=flat-square&logo=tailwindcss)
![Gemini](https://img.shields.io/badge/Gemini-AI-0A84FF?style=flat-square)

PESU Forge is an AI-powered study tool that converts notes into interactive learning experiences — flashcards, quizzes, memory games, and visual mind maps.  
This was my first project that introduced me to building with AI and connecting frontend interfaces to AI-backed features.


## Quick summary

A simple, friendly tool that turns static notes into study activities to improve recall and engagement.


## Tech stack

<p align="left">
<img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,framer,zustand" alt="tech icons" />
</p>

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State | Zustand, React Query |
| AI | Google Gemini 2.5 Flash |


## Features

- Flashcards: AI-generated Q&A cards with flip animations  
- Quiz: multiple-choice quizzes with explanations  
- Memory Match: matching game with score and timer  
- Thoughtscape: visual mind maps generated from notes  
- Upload notes as `.txt` or `.docx`, or paste text directly


## How it works (simple)

1. Paste or upload notes.  
2. AI processes content and extracts concepts.  
3. Choose a learning mode and interact with generated study materials.


## About this project

My first full project — built to learn how AI can enhance web apps. Working on PESU Forge taught me how to integrate AI, structure frontend apps, and design simple interactive learning UIs.


## Run locally

```bash
git clone <repo-url>
cd pesu-forge
npm install
npm run dev
