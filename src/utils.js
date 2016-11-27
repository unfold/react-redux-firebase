export const getSubscriptionKey = (path, query) => JSON.stringify({ path, ...query })
export const getDisplayName = Component => Component.displayName || Component.name || 'Component'
