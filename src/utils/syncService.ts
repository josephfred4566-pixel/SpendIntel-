import { getStoredAuthSession } from './auth';

// Extend global Window interface for TypeScript
declare global {
  interface Window {
    syncDataToServer?: () => Promise<void>;
    triggerAppSync?: (platform: string) => Promise<void>;
    initiateOAuth?: (platform: string) => Promise<void>;
    mockTransactions?: any[];
  }
}

/**
 * Initiates OAuth authorization flow by requesting the auth URL from server and redirecting user.
 */
export async function initiateOAuth(platform: string) {
    const session = getStoredAuthSession();
    const token = session?.token || '';
    
    const urlsToTry = [
        `http://localhost:3000/api/v1/auth/${platform}`,
        `/api/v1/auth/${platform}`
    ];

    let lastError: any = null;

    for (const url of urlsToTry) {
        try {
            const response = await fetch(url, {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (response.ok) {
                const data = await response.json();
                
                if (data.authorizationUrl) {
                    console.log(`[OAuth Service] Authorization URL received for ${platform}:`, data.authorizationUrl);
                    try {
                        if (data.authorizationUrl.startsWith('http://') || data.authorizationUrl.startsWith('https://')) {
                            window.open(data.authorizationUrl, '_blank', 'noopener,noreferrer');
                        } else {
                            window.location.href = data.authorizationUrl;
                        }
                    } catch (navError) {
                        console.warn('[OAuth Service] Cross-origin frame navigation prevented:', navError);
                    }
                    return;
                }
            }
        } catch (error) {
            console.warn(`OAuth initiation attempt to ${url} failed:`, error);
            lastError = error;
        }
    }

    console.error('OAuth initiation failed:', lastError);
}

/**
 * Sends transaction data to the running backend server.
 * Handles HTTPS mixed-content restrictions gracefully by trying relative /api/v1/sync endpoint.
 */
export async function syncDataToServer() {
    const session = getStoredAuthSession();
    const token = session?.token || '';
    const activeUserId = session?.user?.id || 'usr-corp-001';

    const payload = {
        userId: activeUserId,
        companyType: localStorage.getItem("spendIntel_companyType") || session?.user?.companyType || "Enterprise",
        transactions: window.mockTransactions || [],
        timestamp: new Date().toISOString()
    };

    const customUrl = localStorage.getItem("spendIntel_syncUrl");
    const urlsToTry = customUrl 
        ? [customUrl, '/api/v1/sync', 'http://localhost:3000/api/v1/sync']
        : ['/api/v1/sync', 'http://localhost:3000/api/v1/sync'];

    let lastError: any = null;

    for (const url of urlsToTry) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    'x-user-id': activeUserId
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Server Sync Response:', result);
                alert('Data successfully synced to server!');
                return;
            }
        } catch (error) {
            console.warn(`Sync attempt to ${url} failed:`, error);
            lastError = error;
        }
    }

    console.error('Sync failed:', lastError);
    alert('Failed to connect to local server.');
}

/**
 * Triggers platform connector sync for quickbooks or xero.
 */
export async function triggerAppSync(platform: string) {
    const session = getStoredAuthSession();
    const token = session?.token || '';
    const activeUserId = session?.user?.id || 'usr-corp-001';

    const endpoints: Record<string, string> = {
        quickbooks: 'http://localhost:3000/api/v1/sync/quickbooks',
        xero: 'http://localhost:3000/api/v1/sync/xero'
    };

    const mockExternalData = [
        { id: `${platform}_001`, merchant: 'AWS Cloud', amount: 450.00, date: '2026-09-11' },
        { id: `${platform}_002`, merchant: 'Stripe Fees', amount: 32.50, date: '2026-09-11' }
    ];

    const targetUrl = endpoints[platform] || `http://localhost:3000/api/v1/sync/${platform}`;
    const urlsToTry = [targetUrl, `/api/v1/sync/${platform}`];

    let lastError: any = null;

    for (const url of urlsToTry) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    'x-user-id': activeUserId
                },
                body: JSON.stringify({
                    accessToken: "mock_oauth_token_xyz",
                    transactions: mockExternalData
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`${platform} Sync Success:`, result);
                alert(`Successfully synced data from ${platform}!`);
                return;
            }
        } catch (error) {
            console.warn(`${platform} Sync attempt to ${url} failed:`, error);
            lastError = error;
        }
    }

    console.error(`${platform} Sync Failed:`, lastError);
    alert(`Error connecting to sync server for ${platform}.`);
}

// Attach functions globally to window object for manual console or external script execution
if (typeof window !== 'undefined') {
    window.syncDataToServer = syncDataToServer;
    window.triggerAppSync = triggerAppSync;
    window.initiateOAuth = initiateOAuth;
}

