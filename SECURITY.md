## Security Policy

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

### Reporting a Vulnerability

Security vulnerabilities should be reported privately rather than through public channels.

**Email:** ashok1706@users.noreply.github.com

#### Required Information

When submitting a report, include:
- Vulnerability description
- Reproduction steps
- Potential impact assessment
- Optional: proposed solution

#### Timeline Expectations

- Acknowledgment: 48 hours
- Initial assessment: 1 week
- Fix availability: Typically 2 weeks (varies by severity)

### Security Considerations

portwiz interacts with system processes and executes shell commands. The following safeguards are in place:

- **Input validation**: Port numbers are validated (1–65535) before any system calls
- **No arbitrary command execution**: Only predefined OS commands are used (`netstat`, `lsof`, `ss`, `taskkill`)
- **Confirmation prompts**: Process killing requires explicit user confirmation (unless `--force` is used)
- **Non-TTY safety**: In non-interactive environments, portwiz refuses to kill processes unless `--force` is explicitly set

### Security Recommendations

1. Avoid running portwiz with elevated privileges unless necessary
2. Use `--force` only in trusted automation pipelines
3. Review process information before confirming kills in interactive mode

### Acknowledgments

The project recognizes security researchers contributing to user safety.
