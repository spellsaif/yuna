/**
 * Helper function to parse cookies from a cookie header.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(";").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key && value) {
        cookies[key.trim()] = decodeURIComponent(value.trim());
      }
    });
    return cookies;
  }

