import * as si from "simple-icons";

type IconEntry = { path: string; hex: string; title: string };

/**
 * Inline SVG marks for vendors Simple Icons no longer ships (brand-policy removals).
 * Paths are simplified, original-color glyphs.
 */
const CUSTOM: Record<string, IconEntry> = {
  aws: {
    title: "Amazon Web Services",
    hex: "FF9900",
    path: "M6.76 13.9c0 .3.03.55.09.73.07.18.16.38.28.6a.36.36 0 0 1 .06.19c0 .08-.05.16-.16.24l-.53.35a.4.4 0 0 1-.22.08c-.08 0-.16-.04-.24-.12a2.5 2.5 0 0 1-.29-.38 6.2 6.2 0 0 1-.25-.47c-.66.78-1.49 1.17-2.49 1.17-.71 0-1.28-.2-1.69-.61-.42-.4-.63-.95-.63-1.63 0-.72.26-1.31.78-1.75.52-.45 1.21-.67 2.09-.67.29 0 .59.03.9.07.32.05.64.12.98.2v-.62c0-.65-.13-1.1-.4-1.36-.27-.26-.73-.39-1.39-.39-.3 0-.61.04-.93.11-.32.08-.63.17-.93.29a2.5 2.5 0 0 1-.3.11.53.53 0 0 1-.14.03c-.12 0-.18-.09-.18-.27v-.42c0-.14.02-.24.06-.31a.66.66 0 0 1 .25-.18c.3-.16.66-.29 1.08-.39A5.2 5.2 0 0 1 4.14 8c1.02 0 1.76.23 2.24.69.47.46.71 1.16.71 2.1v2.77zm-3.44 1.29c.28 0 .57-.05.88-.15.3-.11.58-.3.81-.55.14-.16.24-.35.3-.56.05-.21.09-.47.09-.77v-.37a7.2 7.2 0 0 0-.79-.15 6.4 6.4 0 0 0-.8-.05c-.58 0-1 .11-1.28.35-.28.23-.42.56-.42.99 0 .41.1.72.32.92.21.22.51.34.89.34zm6.8.92c-.16 0-.27-.03-.34-.09-.07-.06-.13-.18-.19-.36L7.62 8.72a1.6 1.6 0 0 1-.08-.37c0-.15.07-.23.22-.23h.83c.17 0 .29.03.35.09.07.06.12.18.18.36l1.4 5.54 1.31-5.54c.05-.18.1-.3.17-.36.07-.06.19-.09.35-.09h.68c.17 0 .29.03.36.09.07.06.13.18.17.36l1.32 5.6 1.45-5.6c.06-.18.12-.3.18-.36a.58.58 0 0 1 .35-.09h.79c.15 0 .23.08.23.23a.9.9 0 0 1-.02.15 1.3 1.3 0 0 1-.06.23l-2.02 6.49c-.06.18-.12.3-.19.36-.07.06-.19.09-.34.09h-.73c-.17 0-.29-.03-.36-.09-.07-.07-.13-.19-.17-.37l-1.3-5.4-1.3 5.39c-.05.18-.1.3-.17.37-.07.06-.2.09-.36.09h-.73zm10.88.22c-.42 0-.84-.05-1.24-.14-.4-.1-.72-.2-.93-.32a.58.58 0 0 1-.25-.23.57.57 0 0 1-.05-.22v-.44c0-.18.07-.27.2-.27.05 0 .1.01.16.03l.21.09c.28.13.6.23.93.3.34.07.67.1 1.01.1.54 0 .95-.09 1.24-.28.29-.19.44-.46.44-.81 0-.24-.08-.44-.23-.6-.16-.16-.45-.31-.87-.45l-1.25-.39c-.63-.2-1.09-.49-1.38-.88a2.06 2.06 0 0 1-.43-1.25c0-.36.08-.68.23-.95.16-.28.37-.52.63-.71.26-.2.56-.34.91-.44.35-.1.72-.14 1.1-.14.19 0 .38.01.57.04l.56.09c.18.04.35.08.51.13.16.05.28.1.37.15.12.07.21.14.26.22a.5.5 0 0 1 .08.29v.4c0 .18-.07.28-.2.28a.9.9 0 0 1-.33-.11 3.98 3.98 0 0 0-1.66-.33c-.49 0-.87.08-1.14.24-.26.16-.4.4-.4.75 0 .24.09.44.26.6.18.17.5.33.96.48l1.22.39c.62.2 1.07.47 1.34.83.27.35.4.76.4 1.21 0 .37-.08.7-.22 1a2.3 2.3 0 0 1-.64.76c-.27.21-.6.37-.98.48-.4.12-.81.18-1.26.18z",
  },
  linkedin: {
    title: "LinkedIn",
    hex: "0A66C2",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z",
  },
};

/** Human label -> Simple Icons export key (or CUSTOM key). */
const ALIASES: Record<string, string> = {
  "node.js": "Nodedotjs",
  node: "Nodedotjs",
  "next.js": "Nextdotjs",
  javascript: "Javascript",
  typescript: "Typescript",
  python: "Python",
  go: "Go",
  golang: "Go",
  react: "React",
  graphql: "Graphql",
  express: "Express",
  fastapi: "Fastapi",
  nestjs: "Nestjs",
  postgresql: "Postgresql",
  postgres: "Postgresql",
  mongodb: "Mongodb",
  mysql: "Mysql",
  redis: "Redis",
  docker: "Docker",
  kubernetes: "Kubernetes",
  terraform: "Terraform",
  nginx: "Nginx",
  kafka: "Apachekafka",
  rabbitmq: "Rabbitmq",
  elasticsearch: "Elasticsearch",
  grafana: "Grafana",
  prometheus: "Prometheus",
  jenkins: "Jenkins",
  git: "Git",
  github: "Github",
  gmail: "Gmail",
  linux: "Linux",
  "google cloud": "Googlecloud",
  gcp: "Googlecloud",
  firebase: "Firebase",
  supabase: "Supabase",
  cloudflare: "Cloudflare",
  sentry: "Sentry",
  datadog: "Datadog",
  swagger: "Swagger",
  postman: "Postman",
  jira: "Jira",
  auth0: "Auth0",
  oidc: "Openid",
  "openid connect": "Openid",
  "oauth 2.0": "Openid",
  oauth: "Openid",
  jwt: "Jsonwebtokens",
  tailwindcss: "Tailwindcss",
  vite: "Vite",
  stripe: "Stripe",
  // Custom marks
  aws: "aws",
  "amazon web services": "aws",
  "aws ec2": "aws",
  "aws lambda": "aws",
  lambda: "aws",
  s3: "aws",
  dynamodb: "aws",
  cloudwatch: "aws",
  linkedin: "linkedin",
};

export function resolveBrand(name: string): IconEntry | null {
  const key = ALIASES[name.trim().toLowerCase()];
  if (!key) return null;
  if (CUSTOM[key]) return CUSTOM[key];
  const icon = (si as unknown as Record<string, IconEntry | undefined>)["si" + key];
  return icon ?? null;
}

interface BrandIconProps {
  name: string;
  size?: number;
  className?: string;
  /** Render in the brand's official color (default) or inherit currentColor. */
  color?: boolean;
}

/**
 * Official technology logo in its brand color — the only source of color in this UI.
 * Falls back to a neutral monogram chip when no official mark exists.
 */
export function BrandIcon({ name, size = 16, className, color = true }: BrandIconProps) {
  const icon = resolveBrand(name);

  if (!icon) {
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 items-center justify-center rounded-[3px] border border-border bg-secondary text-xs font-semibold uppercase text-muted-foreground ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        {name.trim().charAt(0)}
      </span>
    );
  }

  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className ?? ""}`}
      fill={color ? `#${icon.hex}` : "currentColor"}
    >
      <path d={icon.path} />
    </svg>
  );
}
