"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
} from "lucide-react"

interface ProfileCardTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function ProfileCardTemplate({ config, onDataChange }: ProfileCardTemplateProps) {
  const { profile, actions } = config

  const handleActionClick = (action: string) => {
    onDataChange({ action })
  }

  // Render social icon based on platform name
  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "github":
        return <Github className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  return (
    <Card className="overflow-hidden">
      {profile.coverImageUrl && (
        <div className="h-32 w-full">
          <img
            src={profile.coverImageUrl || "/placeholder.svg?height=128&width=400"}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className={`p-6 ${profile.coverImageUrl ? "-mt-12" : ""}`}>
        <div className="flex flex-col items-center text-center">
          {profile.avatarUrl && (
            <div className="relative mb-4">
              <img
                src={profile.avatarUrl || "/placeholder.svg?height=96&width=96"}
                alt={profile.name}
                className="h-24 w-24 rounded-full border-4 border-background object-cover"
              />
            </div>
          )}
          <h2 className="text-xl font-bold">{profile.name}</h2>
          {profile.title && <p className="text-sm text-muted-foreground">{profile.title}</p>}
          {profile.company && <p className="text-sm font-medium">{profile.company}</p>}

          {profile.stats && profile.stats.length > 0 && (
            <div className="mt-4 flex justify-center gap-4">
              {profile.stats.map((stat: any, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-lg font-bold">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {profile.bio && <p className="mt-4 text-sm text-center">{profile.bio}</p>}

          <div className="mt-6 w-full space-y-4">
            {(profile.location || profile.email || profile.phone || profile.website) && (
              <div className="space-y-2">
                {profile.location && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${profile.email}`} className="hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone}`} className="hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            )}

            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div className="flex justify-center gap-2">
                {profile.socialLinks.map((link: any, index: number) => (
                  <Button key={index} variant="ghost" size="icon" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.icon ? renderSocialIcon(link.icon) : renderSocialIcon(link.platform)}
                    </a>
                  </Button>
                ))}
              </div>
            )}

            {actions && actions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {actions.map((action: any, index: number) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    onClick={() => handleActionClick(action.action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
