# Contributing to portwiz

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/portwiz.git
   cd portwiz
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b feat/my-feature
   ```

## Development

### Building

```bash
npm run build          # Compile TypeScript
npm run dev            # Watch mode
```

### Running Tests

```bash
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode
```

### Code Style

- We use Prettier for formatting and ESLint for linting
- Run `npm run lint` before submitting a PR
- Run `npm run format` to auto-fix formatting

### Project Structure

```
src/
  cli.ts              # CLI entry point (Commander.js)
  commands/           # Command handlers (free, dev, switch, doctor)
  platform/           # Cross-platform port detection and process killing
  ui/                 # Terminal output and interactive prompts
  utils/              # Shared utilities (port validation, exec wrapper)
```

## Making Changes

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `test:` — Adding or updating tests
- `chore:` — Maintenance (deps, CI, config)
- `refactor:` — Code change that neither fixes a bug nor adds a feature

Examples:
```
feat: add port range scanning
fix: handle IPv6 addresses in netstat output
docs: add examples for doctor mode
```

### Pull Request Process

1. Ensure all tests pass (`npm test`)
2. Update documentation if your change affects the public API
3. Add tests for new functionality
4. Keep PRs focused — one feature or fix per PR
5. Fill out the PR template

### What We Look For

- **Tests**: All new code should have tests
- **Cross-platform**: Changes must work on Windows, macOS, and Linux
- **Simplicity**: Prefer simple, readable code over clever solutions
- **Documentation**: Update README if you change public-facing behavior

## Reporting Bugs

Open an issue using the **Bug Report** template. Include:

- Node.js version
- Operating system
- Minimal reproduction steps
- Expected vs actual behavior

## Requesting Features

Open an issue using the **Feature Request** template. Describe:

- The problem you're trying to solve
- Your proposed solution
- Alternatives you've considered

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Questions?

Open a [Discussion](https://github.com/ashok1706/portwiz/discussions) or reach out via issues.

Thank you for contributing!
