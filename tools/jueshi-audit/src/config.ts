/**
 * Configuration for the jueshi-audit tool.
 *
 * No secrets are stored or read here — only base URL, timeouts, and
 * output preferences. All values can be overridden via CLI args or
 * environment variables.
 */

export interface AuditConfig {
  /** Base URL to audit (no trailing slash). */
  baseUrl: string;
  /** Per-request timeout in milliseconds. */
  timeout: number;
  /** Number of retries on transient failure (0 = no retry). */
  retries: number;
  /** Directory for JSON report output. */
  outputDir: string;
  /** Suite names to run (empty = run all). */
  suites: string[];
  /** Show detailed output including check details. */
  verbose: boolean;
  /** Whether to write a JSON report file. */
  jsonReport: boolean;
}

// ── Defaults ──────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://i.jueshi.net';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 0;
const DEFAULT_OUTPUT_DIR = './reports';

// ── Env helpers ───────────────────────────────────────────────

function envString(key: string): string | undefined {
  const val = process.env[key];
  return val && val.length > 0 ? val : undefined;
}

function envNumber(key: string): number | undefined {
  const val = process.env[key];
  if (!val) return undefined;
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}

// ── CLI arg parsing ───────────────────────────────────────────

/**
 * Parse CLI arguments into a partial config.
 * Supports: --base-url, --timeout, --retries, --output-dir,
 *           --suite, --verbose, --no-json, --help
 */
export function parseArgs(argv: string[]): Partial<AuditConfig> {
  const config: Partial<AuditConfig> = {};
  const suites: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '--base-url':
      case '-u':
        config.baseUrl = argv[++i];
        break;

      case '--timeout':
      case '-t':
        config.timeout = Number(argv[++i]);
        break;

      case '--retries':
      case '-r':
        config.retries = Number(argv[++i]);
        break;

      case '--output-dir':
      case '-o':
        config.outputDir = argv[++i];
        break;

      case '--suite':
      case '-s': {
        const raw = argv[++i] ?? '';
        suites.push(...raw.split(',').map((s) => s.trim()).filter(Boolean));
        break;
      }

      case '--verbose':
      case '-v':
        config.verbose = true;
        break;

      case '--no-json':
        config.jsonReport = false;
        break;

      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;

      default:
        // Silently ignore unknown args
        break;
    }
  }

  if (suites.length > 0) {
    config.suites = suites;
  }

  return config;
}

// ── Config factory ────────────────────────────────────────────

/**
 * Create a full AuditConfig, merging overrides → env vars → defaults.
 */
export function createConfig(overrides: Partial<AuditConfig> = {}): AuditConfig {
  return {
    baseUrl:
      overrides.baseUrl ??
      envString('BASE_URL') ??
      envString('AUDIT_BASE_URL') ??
      DEFAULT_BASE_URL,

    timeout:
      overrides.timeout ?? envNumber('AUDIT_TIMEOUT') ?? DEFAULT_TIMEOUT,

    retries:
      overrides.retries ?? envNumber('AUDIT_RETRIES') ?? DEFAULT_RETRIES,

    outputDir:
      overrides.outputDir ?? envString('AUDIT_OUTPUT_DIR') ?? DEFAULT_OUTPUT_DIR,

    suites: overrides.suites ?? [],

    verbose:
      overrides.verbose ??
      ['1', 'true', 'yes'].includes(process.env.AUDIT_VERBOSE ?? ''),

    jsonReport:
      overrides.jsonReport ??
      !['0', 'false', 'no'].includes(process.env.AUDIT_JSON_REPORT ?? ''),
  };
}

// ── Help ──────────────────────────────────────────────────────

function printHelp(): void {
  console.log(`
jueshi-audit — Read-only site audit for jueshi.net / xixiong-saas

Usage: tsx src/index.ts [options]

Options:
  -u, --base-url <url>     Base URL to audit (default: ${DEFAULT_BASE_URL})
  -t, --timeout <ms>       Request timeout in milliseconds (default: ${DEFAULT_TIMEOUT})
  -r, --retries <n>        Number of retries on failure (default: ${DEFAULT_RETRIES})
  -o, --output-dir <path>  Output directory for JSON reports (default: ${DEFAULT_OUTPUT_DIR})
  -s, --suite <names>      Comma-separated suite names to run (default: all)
  -v, --verbose            Show detailed output including check details
      --no-json            Disable JSON report output
  -h, --help               Show this help message

Environment variables:
  BASE_URL                 Override base URL
  AUDIT_BASE_URL           Override base URL (alternative)
  AUDIT_TIMEOUT            Override timeout
  AUDIT_RETRIES            Override retries
  AUDIT_OUTPUT_DIR         Override output directory
  AUDIT_VERBOSE            Enable verbose output (1 / true / yes)
  AUDIT_JSON_REPORT        Disable JSON report (0 / false / no)

Examples:
  tsx src/index.ts                                    # Audit staging with all suites
  tsx src/index.ts --base-url https://jueshi.net      # Audit production
  tsx src/index.ts --suite p0-public-pages            # Run only public pages suite
  tsx src/index.ts -s p0-public-pages,p0-redirects    # Run specific suites
  tsx src/index.ts --verbose                          # Verbose output
`);
}
