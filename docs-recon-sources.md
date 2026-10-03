# Recon integration references

The Recon pipeline is designed around the official capabilities documented by the tool maintainers:

- ProjectDiscovery Subfinder overview: https://docs.projectdiscovery.io/opensource/subfinder/overview
  - Passive subdomain discovery with modular online sources and JSON/file output.
- OWASP Amass project: https://owasp.org/projects/amass/
  - External asset discovery and attack-surface mapping using OSINT and reconnaissance techniques.
- ProjectDiscovery HTTPx overview: https://docs.projectdiscovery.io/tools/httpx/overview
  - Scoped HTTP metadata probing with status, title, technology, retries, and rate controls.
- ProjectDiscovery DNSx overview: https://docs.projectdiscovery.io/tools/dnsx/overview
  - DNS resolution and record probing for A, AAAA, CNAME, MX, NS, TXT, and related records.
- OWASP Amass installation guide: https://github.com/OWASP/Amass/wiki/Installation-Guide
  - Official prebuilt binaries and Docker installation guidance.

Pinned runtime versions in the project Dockerfile are Subfinder 2.16.0, Amass 5.1.1, DNSx 1.3.1, and HTTPx 1.12.0. Use only against targets that are owned or explicitly authorized for assessment.
