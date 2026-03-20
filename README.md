<div align="center">

# 🚨 National Emergency Response & Dispatch Coordination Platform

**CPEN 421 — University of Ghana — 2025/2026**

*A production-grade, distributed microservices system for coordinating real-time emergency responses across Ghana.*

[![Platform](https://img.shields.io/badge/Platform-Microservices-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20TypeScript-2496ED.svg)](#)
[![Docs](https://img.shields.io/badge/Docs-Swagger%20OpenAPI-success.svg)](#)

</div>

---

## 📖 Overview

The National Emergency Response & Dispatch Coordination Platform is a modern, highly scalable system designed to streamline communication and operations during emergencies. By leveraging a distributed microservices architecture, the application ensures reliable access, real-time live tracking, and seamless cross-service communication to coordinate responders efficiently. It abstracts away the complexities of dispatch logistics, empowering emergency teams to act faster.

## ✨ Key Features & Capabilities

- **🔐 Secure Identity & Access Management**: Centralized role-based authentication leveraging JWTs and secure password hashing.
- **🚨 Incident Management Workflow**: Comprehensive lifecycle tracking of emergencies, from initial report creation to active dispatch and resolution.
- **📍 Real-Time Dispatch Tracking**: Live updates and GPS monitoring of emergency medical services and responders using `Socket.io` WebSockets.
- **🤖 AI-Powered Call Handling**: Intelligent emergency call processing, utilizing the **Groq SDK** and **Whisper STT** models for high-speed, accurate speech-to-text transcriptions when dispatchers are overwhelmed.
- **📨 Asynchronous Messaging**: Robust inter-service communication via **RabbitMQ** event queues for delayed tasks and loosely coupled events.
- **📊 Advanced Analytics & Telemetry**: Comprehensive system metric aggregation to evaluate overall response times and system efficiency.
- **🚦 Centralized API Gateway**: A single reliable entry point (Nginx) handling request routing across all inner services.

## 🏗️ Architecture Stack

The platform emphasizes a clean separation of concerns, employing specialized technical stacks for each operational domain:

- **API Gateway**: Nginx routing layer
- **Auth Service**: Node.js/Express, PostgreSQL (Prisma ORM), Redis
- **Incident Service**: Node.js/Express, PostgreSQL (Prisma ORM), RabbitMQ
- **Dispatch Tracking Service**: Node.js/Express, MongoDB (Mongoose), Socket.io
- **Analytics Service**: Node.js/Express, MongoDB (Mongoose)
- **AI Agent Service**: Node.js/Express, Groq SDK (Whisper STT)

## 🚀 Getting Started

The platform utilizes a containerized development environment for quick and consistent local setup.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) & Docker Compose
- Git

### Installation & Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd emergency-platform
   ```

2. **Configure Environment Variables:**
   Copy the provided `.env.example` templates to `.env` in the root folder and configure your secrets (including database URIs and Groq integration API keys).
   ```bash
   cp .env.example .env
   ```

3. **Start the Infrastructure Components:**
   Spin up all necessary local infrastructure engines (PostgreSQL, MongoDB, Redis cache, and RabbitMQ message broker):
   ```bash
   docker-compose up -d
   ```

4. **Run Services Locally:**
   Each service can be run locally in development mode by navigating to its specific directory, installing dependencies, and running the development script. For example, to run the Auth Service:
   ```bash
   cd services/auth-service
   cp .env.example .env   # Hydrate local service keys
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

## 📚 API Documentation

The platform implements self-hosted, interactive API documentation utilizing Swagger UI. When a service is actively running and in development mode, its unique documentation can be accessed locally via `/docs`. 
- For instance, Auth Service documentation is typically available at: `http://localhost:<AUTH_PORT>/docs`

## 📄 License

This specialized academic project is being actively created for **CPEN 421** at the University of Ghana.
