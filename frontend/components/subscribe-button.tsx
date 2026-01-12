"use client"

import { useState } from "react"
import { Bell, BellRing, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { userService } from "@/services/api"

interface SubscribeButtonProps {
  creatorId: string
  initialSubscribed?: boolean
  initialSubscribersCount?: number
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export function SubscribeButton({ 
  creatorId, 
  initialSubscribed = false, 
  initialSubscribersCount = 0,
  className = "",
  variant = "default",
  size = "default"
}: SubscribeButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed)
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount)
  const [isLoading, setIsLoading] = useState(false)

  // Don't show subscribe button for own profile
  if (user?.id === creatorId) {
    return null
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return
    }

    setIsLoading(true)
    
    try {
      if (isSubscribed) {
        // Unsubscribe
        const response = await userService.unsubscribe(creatorId)
        if (response.success) {
          setIsSubscribed(false)
          setSubscribersCount(response.subscribersCount)
        }
      } else {
        // Subscribe
        const response = await userService.subscribe(creatorId)
        if (response.success) {
          setIsSubscribed(true)
          setSubscribersCount(response.subscribersCount)
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      // Could show toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const buttonProps = {
    onClick: handleSubscribe,
    disabled: isLoading || !isAuthenticated,
    className,
    variant: isSubscribed ? "outline" : variant,
    size
  }

  if (!isAuthenticated) {
    return (
      <Button {...buttonProps}>
        <Bell className="w-4 h-4 mr-2" />
        Subscribe
      </Button>
    )
  }

  return (
    <Button {...buttonProps}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="w-4 h-4 mr-2" />
      ) : (
        <Bell className="w-4 h-4 mr-2" />
      )}
      {isSubscribed ? "Subscribed" : "Subscribe"}
    </Button>
  )
}

// Subscriber count display component
export function SubscriberCount({ count, className = "" }: { count: number; className?: string }) {
  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className={`text-sm text-muted-foreground ${className}`}>
      {formatCount(count)} subscriber{count !== 1 ? 's' : ''}
    </div>
  )
}
