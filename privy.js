// Privy configuration for LoopState
export const privyConfig = {
  appId: 'cmcuopqj300bajp0m790dgeil',
  config: {
    // Appearance customization
    appearance: {
      theme: 'dark',
      accentColor: '#8B5CF6',
      logo: 'https://polisdkr.manus.space/logo.png',
    },
    // Login methods
    loginMethods: ['email', 'sms', 'wallet', 'google', 'twitter', 'discord'],
    // Embedded wallet configuration
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
    // Default chain (Ethereum mainnet)
    defaultChain: {
      id: 1,
      name: 'Ethereum',
      network: 'homestead',
      nativeCurrency: {
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: {
          http: ['https://cloudflare-eth.com'],
        },
        public: {
          http: ['https://cloudflare-eth.com'],
        },
      },
    },
    // Legal links
    legal: {
      termsAndConditionsUrl: 'https://polisdkr.manus.space/terms',
      privacyPolicyUrl: 'https://polisdkr.manus.space/privacy',
    },
  },
  secret: 'FMRiCAJGpBCLQr7LLGHpB8EVqifFYVcBGQ73MPnCQeKbL4oxZmb7mNHF1hW6p4q62ej7MhK3qW7nXu3hGcyoUt4',
  jwksUrl: 'https://auth.privy.io/api/v1/apps/cmcuopqj300bajp0m790dgeil/jwks.json'
}

