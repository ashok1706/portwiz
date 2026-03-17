# 🚀 portwiz

**Fix port conflicts instantly and run your dev server without interruptions.**

```bash
npx portwiz 3000
```

---

## 😩 The Problem

Every developer has seen this:

```
Error: EADDRINUSE: address already in use :::3000
```

Then you:

* Search for the process using the port
* Run `lsof` / `netstat`
* Kill processes manually
* Repeat again tomorrow 😑

👉 It breaks your flow.

---

## ⚡ The Solution

**portwiz** handles everything in one command:

```bash
npx portwiz 3000
```

* Detects what’s using the port
* Shows the process clearly
* Frees it instantly

No guesswork. No manual steps.

---

## 📦 Installation

```bash
# Run instantly (recommended)
npx portwiz 3000

# Or install globally
npm install -g portwiz
```

**Requirements:** Node.js 18+

---

## 🧪 Usage

---

### 🔧 Free a port

```bash
portwiz 3000
```

```
ℹ Checking port 3000...
⚠ Port 3000 is in use

  PID:     1234
  Process: node

? Kill this process to free port 3000? (y/N) y
✔ Port 3000 is now free
```

---

### ⚡ Force mode

Skip confirmation:

```bash
portwiz 3000 --force
```

---

### 🔀 Smart switch

Find the next available port instead of killing:

```bash
portwiz 3000 --switch
```

```
ℹ Port 3000 is in use by node (PID 1234)
✔ Port 3001 is available
```

---

### 🔥 Dev mode (run + fix in one command)

```bash
portwiz dev 3000 -- npm run dev
```

```
⚠ Port 3000 is in use by node (PID 1234)
? Kill node (PID 1234)? (y/N) y
✔ Port 3000 is now free

ℹ Starting: npm run dev
```

👉 Automatically sets the `PORT` environment variable.

---

### 🧠 Doctor mode

Scan common development ports:

```bash
portwiz doctor
```

```
ℹ Scanning development ports...

  PORT    STATUS    PROCESS
  3000    in use    node (PID 1234)
  3001    free      -
  4200    free      -
  5000    in use    python3 (PID 5678)
  5173    free      -
  8080    in use    java (PID 9012)

⚠ 3 ports are in use

? Free all 3 busy ports? (y/N) y
✔ All ports are now free
```

Custom ports:

```bash
portwiz doctor --ports 4000,4001,4002
```

---

## 📖 Commands

| Command                       | Description               |
| ----------------------------- | ------------------------- |
| `portwiz <port>`              | Detect and free a port    |
| `portwiz <port> --switch`     | Find next available port  |
| `portwiz dev <port> -- <cmd>` | Free port and run command |
| `portwiz doctor`              | Scan common dev ports     |

---

## ⚙️ Options

| Flag             | Short | Description                            |
| ---------------- | ----- | -------------------------------------- |
| `--force`        | `-f`  | Kill without confirmation              |
| `--switch`       | `-s`  | Find next free port instead of killing |
| `--ports <list>` | —     | Custom ports (doctor mode)             |
| `--version`      | `-V`  | Show version                           |
| `--help`         | `-h`  | Show help                              |

---

## 🌍 Cross-platform

Works out of the box on all major platforms:

| Platform | Detection              | Kill                |
| -------- | ---------------------- | ------------------- |
| Windows  | `netstat` + `tasklist` | `taskkill`          |
| macOS    | `lsof`                 | `SIGTERM / SIGKILL` |
| Linux    | `lsof` / `ss`          | `SIGTERM / SIGKILL` |

---

## 🎯 Use Cases

* React / Vite / Next.js dev servers
* Node.js / Express apps
* Full-stack local development
* Docker port conflicts
* Multi-service environments

---

## 💡 Why portwiz?

* ⚡ Zero setup
* 🧠 Smart defaults
* 🔥 Dev-friendly workflow
* ⏱ Saves time every day

---

## 🚀 One-line Pitch

> Stop fixing ports. Start building.

---

## 📄 License

MIT
