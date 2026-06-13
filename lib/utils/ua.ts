export interface ParsedUA {
  device: string;
  os: string;
  browser: string;
}

export function parseUserAgent(ua: string): ParsedUA {
  let device = "Desktop";
  let os = "Other";
  let browser = "Other";

  const uaLower = ua.toLowerCase();

  // Device detection
  if (/tablet|ipad|playbook|silk/i.test(uaLower)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(uaLower)) {
    device = "Mobile";
  }

  // OS detection
  if (/iphone|ipad|ipod/i.test(uaLower)) {
    os = "iOS";
  } else if (/android/i.test(uaLower)) {
    os = "Android";
  } else if (/macintosh|mac os x/i.test(uaLower)) {
    os = "macOS";
  } else if (/windows/i.test(uaLower)) {
    os = "Windows";
  } else if (/linux/i.test(uaLower)) {
    os = "Linux";
  }

  // Browser detection
  if (/edg/i.test(uaLower)) {
    browser = "Edge";
  } else if (/chrome|crios/i.test(uaLower)) {
    browser = "Chrome";
  } else if (/safari/i.test(uaLower)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(uaLower)) {
    browser = "Firefox";
  } else if (/opr\//i.test(uaLower)) {
    browser = "Opera";
  }

  return { device, os, browser };
}
