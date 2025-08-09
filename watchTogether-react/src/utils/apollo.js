export function getGraphQLErrorMessage(error, fallback = 'An unexpected error occurred') {
  try {
    // Prefer GraphQL errors (HTTP 200 with errors[])
    if (error?.graphQLErrors?.length) {
      for (const ge of error.graphQLErrors) {
        const msg = ge?.extensions?.originalError?.message || ge?.message;
        if (msg) return cleanMessage(msg);
      }
    }
    // Some servers put errors under networkError.result.errors
    const net = error?.networkError;
    if (net?.result?.errors?.length) {
      for (const ne of net.result.errors) {
        const msg = ne?.extensions?.originalError?.message || ne?.message;
        if (msg) return cleanMessage(msg);
      }
    }
    if (net?.message) return cleanMessage(net.message);
    if (error?.message) return cleanMessage(error.message);
  } catch (_) {
    // ignore
  }
  return fallback;
}

function cleanMessage(message) {
  if (!message) return message;
  // Strip common prefixes from gateway/GraphQL
  return message
    .replace(/^Exception while fetching data \([^)]*\)\s*:\s*/i, '')
    .replace(/^(INTERNAL|INVALID_ARGUMENT|NOT_FOUND|UNAUTHENTICATED|PERMISSION_DENIED)\s*:\s*/i, '')
    .trim();
}


