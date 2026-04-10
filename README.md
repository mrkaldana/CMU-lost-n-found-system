Username: admin
password: admin

## Setup

After cloning, install dependencies from the project root:

```bash
npm install
```

The root install now also installs `server` dependencies automatically through `postinstall`, so you do not need to run a second install inside `server`.

## Run

Start the app from the project root:

```bash
npm run dev
```

This starts both frontend and backend together.

## Password Policy

User account passwords must contain:

- At least 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
