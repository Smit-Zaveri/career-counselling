<div align="center">
  <br />
    <img src="https://github.com/adrianhajdin/project_react_native_jobs/assets/151519281/e7514725-0706-4080-bee4-b042554dabf7" alt="Project Banner">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="react.js" />
    <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="expo" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=FFCA28" alt="firebase" />
  </div>

  <h3 align="center">Career Connect: Job Search & Professional Development</h3>

   <div align="center">
     A comprehensive career development platform built with React Native and Firebase
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 📱 [App Structure](#app-structure)
6. 🔗 [API Integration](#api-integration)
7. 🧠 [Learning Resources](#learning-resources)

## <a name="introduction">🤖 Introduction</a>

Career Connect is a comprehensive career development platform built with React Native and Firebase. It offers job search functionality, community interaction, and personalized learning roadmaps to help users advance their tech careers.

The app is designed to provide an all-in-one solution for job seekers by combining job listings, professional networking, and skill development in a single mobile application.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **React Native** - Mobile application framework
- **Expo** - Development tooling and deployment
- **Firebase** - Authentication, database, and cloud functions
- **Firebase Firestore** - NoSQL database for storing job listings and user data
- **React Navigation** - Navigation management
- **Expo Router** - File-based routing for mobile apps
- **AsyncStorage** - Local data persistence
- **Linear Gradient** - UI styling components
- **React Native Vector Icons** - Icon library

## <a name="features">🔋 Features</a>

👉 **Job Search & Discovery**: Browse jobs by popularity, category, or location with advanced filtering options

👉 **Save & Manage Jobs**: Save interesting job listings and easily access them later

👉 **Community Platform**: Join professional communities to network, ask questions, and share insights

👉 **Career Roadmaps**: Follow structured learning paths for different technology stacks and roles

👉 **Learning Progress Tracking**: Track your progress through career roadmaps to stay motivated

👉 **Personalized Dashboard**: View activity summaries, job recommendations, and community highlights

👉 **Professional Profiles**: Create and manage your professional profile for networking

👉 **Real-time Chat**: Communicate with community members through integrated chat functionality

👉 **Progress Persistence**: Save your learning progress across app sessions

👉 **Mobile-Optimized Interface**: Responsive design that works on different screen sizes

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

**Cloning the Repository**

```bash
git clone https://github.com/yourusername/career-connect-app.git
cd career-connect-app
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
API_KEY=your_firebase_api_key
AUTH_DOMAIN=your_firebase_auth_domain
PROJECT_ID=your_firebase_project_id
STORAGE_BUCKET=your_firebase_storage_bucket
MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
APP_ID=your_firebase_app_id
```

Replace the placeholder values with your actual Firebase credentials.

**Running the Project**

```bash
npx expo start
```

Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator.

## <a name="app-structure">📱 App Structure</a>

The app is organized into several main sections:

### 🏠 Home
A personalized dashboard with job recommendations, activity summaries, and community highlights.

### 💼 Jobs
Browse and search for jobs by popularity, category, or location. View detailed job information and save jobs for later.

### 👥 Communities
Join and participate in professional communities centered around specific technologies, industries, or topics.

### 🗺️ Roadmaps
Follow structured learning paths for different technologies. Track your progress as you learn new skills.

### 📝 Profile
Manage your professional profile, view saved jobs, and track your application history.

## <a name="api-integration">🔗 API Integration</a>

The app uses Firebase for backend services:

- **Authentication**: User registration and login
- **Firestore**: Storing and retrieving job listings, community data, and user profiles
- **Cloud Storage**: Image storage for community content and user avatars

Job data can be sourced from Firebase or integrated with external job listing APIs.

## <a name="learning-resources">🧠 Learning Resources</a>

The roadmap feature includes learning paths for:

- React
- React Native
- JavaScript
- Frontend Development
- Backend Development
- And many other technology stacks

Each roadmap provides structured learning content with step-by-step guides and resources for skill development.

---

Built with ❤️ using React Native and Expo
