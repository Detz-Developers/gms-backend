# Project Title

A brief one-sentence description of the project. This project contains the Firebase Cloud Functions for our application.

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

You'll need the following software installed on your system:

* **Node.js**: Use a supported LTS version (e.js., Node.js 20 or later). You can download it from [nodejs.org](https://nodejs.org/).
* **npm**: Comes bundled with Node.js.
* **Firebase CLI**: The command-line interface for Firebase.

### 1. Clone the Repository

Clone this repository to your local machine using Git:

```bash
git clone [https://github.com/your-username/your-repository.git](https://github.com/your-username/your-repository.git)
cd your-repository/functions
```

### 2. Install Dependencies
Navigate into the functions directory and install the required Node.js packages:

```bash
npm install
```

### 3. Log in to Firebase
You'll need to authenticate the Firebase CLI with your Google account. Run the following command and follow the on-screen instructions:

```bash
firebase login
```

### 4. Link to Your Firebase Project
Initialize your Firebase project locally. You will be prompted to select a Firebase project from your account.

```bash
firebase init functions
```

### 5. Start the Firebase Emulators
To test your functions locally without deploying them, use the Firebase Emulator Suite. This is the recommended way to develop and debug your functions.

From the root of your project directory (the one containing firebase.json), run:

```bash
firebase emulators:start
```

This will start a local server and give you a URL for the Emulator Suite UI (typically http://localhost:4000), where you can interact with a local instance of Realtime Database, Cloud Functions, and other services.

### 6. Deploy the Functions
Once you are ready to deploy your functions to the live Firebase project, run the following command from the functions directory:

```bash
firebase deploy --only functions
```

## 🛠️ Project Structure
This project uses the following directory structure:

```
/
├── functions/              # Cloud Functions directory
│   ├── src/                # Source code for your functions (if using TypeScript)
│   ├── lib/                # Compiled JavaScript output (if using TypeScript)
│   ├── index.js            # Main entry file for your functions (if using JavaScript)
│   ├── package.json        # Node.js dependencies
│   └── tsconfig.json       # TypeScript configuration (if using TypeScript)
└── firebase.json           # Firebase project configuration
```

## 📜 Scripts
The package.json file in the functions directory includes the following useful scripts:

- `npm run serve`: Starts the Firebase Emulator Suite.
- `npm run build`: Compiles TypeScript files to JavaScript.
- `npm run deploy`: Deploys the functions to Firebase.


