"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Share, MoreHorizontal, Send } from "lucide-react"

interface FeedTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function FeedTemplate({ config, onDataChange }: FeedTemplateProps) {
  const [activeFilter, setActiveFilter] = useState<string>("")
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
    onDataChange({ filter: value })
  }

  // Handle post interaction
  const handlePostInteraction = (postId: string, action: string) => {
    onDataChange({ action, postId })
  }

  // Handle comment toggle
  const handleToggleComments = (postId: string) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId],
    })
  }

  // Handle comment input change
  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: value,
    })
  }

  // Handle comment submit
  const handleCommentSubmit = (postId: string) => {
    if (commentInputs[postId]?.trim()) {
      onDataChange({
        action: "comment",
        postId,
        comment: commentInputs[postId],
      })
      setCommentInputs({
        ...commentInputs,
        [postId]: "",
      })
    }
  }

  // Filter posts if needed
  const filteredPosts = activeFilter
    ? config.posts.filter((post: any) => {
        if (activeFilter.startsWith("tag:")) {
          const tag = activeFilter.substring(4)
          return post.tags && post.tags.includes(tag)
        } else if (activeFilter.startsWith("author:")) {
          const author = activeFilter.substring(7)
          return post.author.name === author
        }
        return true
      })
    : config.posts

  return (
    <div className="space-y-6">
      {/* Filters */}
      {config.filters && config.filters.length > 0 && (
        <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="">All</TabsTrigger>
            {config.filters.map((filter: any) => (
              <TabsTrigger key={filter.id} value={filter.id}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post: any) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="p-4 flex flex-row items-start space-y-0">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={post.author.avatarUrl || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback>
                  {post.author.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    {post.author.title && <p className="text-xs text-muted-foreground">{post.author.title}</p>}
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground mr-2">
                      {new Date(post.timestamp).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="whitespace-pre-line">{post.content}</p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {post.media && post.media.length > 0 && (
                <div
                  className={`mt-3 grid gap-2 ${
                    post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  } rounded-md overflow-hidden`}
                >
                  {post.media.map((item: any, index: number) => (
                    <div key={index} className={post.media.length > 2 && index === 0 ? "col-span-2" : ""}>
                      {item.type === "image" ? (
                        <img
                          src={item.url || "/placeholder.svg?height=300&width=500"}
                          alt="Post media"
                          className="w-full h-full object-cover"
                          style={{ maxHeight: "300px" }}
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          className="w-full"
                          poster={item.thumbnailUrl || "/placeholder.svg?height=300&width=500"}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex flex-col">
              <div className="flex items-center justify-between w-full border-t border-b py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handlePostInteraction(post.id, "like")}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {post.likes > 0 && <span>{post.likes}</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleToggleComments(post.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {post.comments && post.comments.length > 0 && <span>{post.comments.length}</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handlePostInteraction(post.id, "share")}
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Comments */}
              {expandedComments[post.id] && post.comments && post.comments.length > 0 && (
                <div className="w-full mt-2 space-y-3">
                  {post.comments.map((comment: any) => (
                    <div key={comment.id} className="flex items-start space-x-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={comment.author.avatarUrl || "/placeholder.svg?height=28&width=28"} />
                        <AvatarFallback>
                          {comment.author.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted p-2 rounded-md">
                          <p className="text-xs font-medium">{comment.author.name}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <button className="hover:underline mr-2">Like</button>
                          <button className="hover:underline mr-2">Reply</button>
                          <span>{new Date(comment.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              {config.allowComments && expandedComments[post.id] && (
                <div className="w-full mt-3 flex items-center space-x-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center space-x-2">
                    <Textarea
                      placeholder="Write a comment..."
                      className="min-h-0 h-9 py-2 resize-none"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
