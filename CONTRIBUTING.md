# Contributing to BharatUtility

Thank you for your interest in contributing to **BharatUtility**! We welcome bug reports, feature suggestions, documentation improvements, and calculator enhancements from the community.

---

## Code of Conduct & Philosophy

BharatUtility is built for everyday Indian citizens, students, professionals, and small businesses. Our core design tenets are:

1. **Client-Side Privacy First**: Whenever possible, mathematical formulas and calculations should execute locally in the user's browser without harvesting or sending private numbers to remote servers.
2. **Accessible & Responsive**: Fast load times on mobile devices, low-bandwidth networks, and modern smart TVs.
3. **Accuracy & Clarity**: Financial and tax calculations should cite official Government / RBI / IT Department guidelines and display formula breakdowns.

---

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- `npm` (comes with Node) or `bun`

### Setup Steps

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bharatutility.git
   cd bharatutility
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   *(The default local configuration works out of the box for client-side tools and testing).*

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## Development Workflow

### Creating a Branch

Create a descriptive feature or bugfix branch:
```bash
git checkout -b feature/new-calculator-name
# or
git checkout -b fix/emi-rounding-bug
```

### Coding Guidelines

- **TypeScript**: Strict typing is enabled. Avoid using `any` unless interacting with external untyped libraries.
- **Styling**: Use Tailwind CSS utility classes. Ensure dark mode styles (`dark:...`) are provided for all UI elements.
- **Formulas & Math**: Keep math functions pure, deterministic, and unit-tested where feasible.
- **Icons**: Use [lucide-react](https://lucide.dev/) icons.
- **Avoid Unrelated Changes**: Keep pull requests focused on a single feature or bug fix. Avoid sweeping reformatting of unrelated files.

---

## Testing & Quality Verification

Before submitting a Pull Request, ensure that all verification scripts pass:

```bash
# 1. Typecheck & Lint
npm run lint

# 2. Validate Dynamic SEO schemas and tools registry
npm run test:seo

# 3. Generate and verify sitemap
npm run sitemap

# 4. Production build test
npm run build
```

---

## Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `Ashwinpatilr236/bharatutility`.
3. Provide a clear summary of the changes, the tools affected, and any formula references used.
4. If your PR resolves an open issue, link it using `Fixes #issue_number`.

---

## Reporting Issues & Requesting Tools

- **Bug Reports**: Open an issue on GitHub detailing the steps to reproduce, the unexpected calculation result, and your browser/device.
- **New Tool Requests**: Open a feature request issue with the name of the tool, its formula/methodology, and why it benefits Indian users.
- **Security Inquiries**: Please review [SECURITY.md](SECURITY.md) for reporting potential security issues privately.
