import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import ApiService from '../services/api'

// Create authentication context
const AuthContext = createContext()

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    linkEmail, 
    linkWallet,
    unlinkEmail,
    unlinkWallet,
    exportWallet,
    createWallet
  } = usePrivy()
  
  const { wallets } = useWallets()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sync user data with backend when authentication state changes
  useEffect(() => {
    const syncUserData = async () => {
      if (authenticated && user && ready) {
        try {
          // Check if user exists in our backend
          const userData = {
            privy_id: user.id,
            email: user.email?.address || '',
            phone: user.phone?.number || '',
            wallet_address: user.wallet?.address || '',
            username: user.email?.address?.split('@')[0] || `user_${user.id.slice(-8)}`,
            created_at: user.createdAt,
          }

          // Create or update user in backend
          const response = await ApiService.createUser(userData)
          setUserProfile(response)
        } catch (error) {
          console.error('Error syncing user data:', error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    }

    if (ready) {
      syncUserData()
    }
  }, [authenticated, user, ready])

  // Get primary wallet
  const primaryWallet = wallets.length > 0 ? wallets[0] : null

  // Enhanced login function
  const handleLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      await logout()
      setUserProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Create embedded wallet for users without one
  const handleCreateWallet = async () => {
    try {
      await createWallet()
    } catch (error) {
      console.error('Create wallet error:', error)
    }
  }

  // Export wallet for users who want to use it elsewhere
  const handleExportWallet = async () => {
    try {
      await exportWallet()
    } catch (error) {
      console.error('Export wallet error:', error)
    }
  }

  // Link additional authentication methods
  const handleLinkEmail = async () => {
    try {
      await linkEmail()
    } catch (error) {
      console.error('Link email error:', error)
    }
  }

  const handleLinkWallet = async () => {
    try {
      await linkWallet()
    } catch (error) {
      console.error('Link wallet error:', error)
    }
  }

  const value = {
    // Privy state
    ready,
    authenticated,
    user,
    userProfile,
    loading,
    
    // Wallet state
    wallets,
    primaryWallet,
    
    // Authentication methods
    login: handleLogin,
    logout: handleLogout,
    
    // Wallet methods
    createWallet: handleCreateWallet,
    exportWallet: handleExportWallet,
    
    // Linking methods
    linkEmail: handleLinkEmail,
    linkWallet: handleLinkWallet,
    unlinkEmail,
    unlinkWallet,
    
    // Helper methods
    isLoggedIn: authenticated && ready,
    hasWallet: wallets.length > 0,
    hasEmail: user?.email?.address,
    hasPhone: user?.phone?.number,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

