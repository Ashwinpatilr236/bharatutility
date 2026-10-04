# Security Policy

The BharatUtility team takes the security and privacy of our users seriously. We appreciate the responsible disclosure of any potential vulnerabilities.

---

## Reporting a Vulnerability

**Please do NOT disclose security vulnerabilities publicly via GitHub Issues or discussions.**

If you discover a security vulnerability or potential threat in BharatUtility:

1. **Email Privately**: Send full details of the issue to our verified support address:
   **[arrjstechnologies@gmail.com](mailto:arrjstechnologies@gmail.com)**
2. **Subject Line**: Please prefix your subject with `[SECURITY VULNERABILITY]: <Brief Description>`.
3. **Include Details**:
   - Detailed description of the vulnerability.
   - Steps to reproduce or proof-of-concept payload.
   - Potential impact on users or infrastructure.
   - Your contact details for coordinated disclosure and acknowledgment.

### Expected Response Times
- **Initial Acknowledgment**: Within 24 to 48 hours.
- **Triage & Remediation**: We will investigate and coordinate a patch or mitigation as quickly as possible.

---

## Scope & Guidelines

### In Scope
- Client-side data leaks, cross-site scripting (XSS), or injection vulnerabilities.
- Flaws in client-side encryption or privacy-sensitive utilities (e.g. Password Generator, Hash tools).
- Misconfigured API endpoints or improper rate-limiting leading to service degradation.

### Out of Scope
- Denial of Service (DoS/DDoS) attacks against public endpoints.
- Social engineering or phishing attempts against maintainers.
- Reports from automated vulnerability scanners without a working proof-of-concept.

---

## Secure Development & Secret Handling

- **Never Commit Secrets**: Never commit API keys, service-role keys, private database passwords, or personal credentials into git branches or pull requests.
- **Credential Rotation**: If a sensitive token is accidentally committed, treat it as compromised immediately:
  1. Invalidate and rotate the credential in the relevant cloud provider dashboard (e.g. Supabase, hosting provider).
  2. Remove the sensitive file from your local git history before pushing.
  3. Ensure `.env` is listed in `.gitignore`.
