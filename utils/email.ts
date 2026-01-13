export const createFeedbackMailto = (
  recipient: string,
  subject?: string,
  body?: string,
): string => {
  let url = `mailto:${recipient}`;
  const params: string[] = [];

  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  return url;
};
