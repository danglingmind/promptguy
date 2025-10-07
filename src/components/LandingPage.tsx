"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignInButton } from '@clerk/nextjs'
import { 
  TrendingUp, 
  Heart, 
  Eye,
  ArrowRight,
  Code,
  Image as ImageIcon,
  PenTool,
  Brain,
  Lightbulb,
  Users,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'

export function LandingPage() {
  const trendingPosts = [
    {
      title: "The Ultimate ChatGPT Prompt for Code Review",
      excerpt: "A comprehensive prompt that transforms ChatGPT into a senior software engineer, providing detailed code analysis, security insights, and optimization suggestions.",
      author: "Alex Chen",
      authorImage: null,
      readTime: "5 min read",
      likes: 1247,
      comments: 89,
      tags: ["Code Review", "ChatGPT", "Programming"],
      publishedAt: "2 hours ago",
      featured: true
    },
    {
      title: "Midjourney Prompt Engineering: From Beginner to Pro",
      excerpt: "Learn the art of crafting prompts that generate stunning, consistent images. Includes advanced techniques for style transfer, composition control, and character consistency.",
      author: "Sarah Martinez",
      authorImage: null,
      readTime: "8 min read",
      likes: 892,
      comments: 156,
      tags: ["Midjourney", "AI Art", "Prompt Engineering"],
      publishedAt: "4 hours ago",
      featured: false
    },
    {
      title: "Claude-3 for Creative Writing: Prompts That Work",
      excerpt: "Discover the prompts that professional writers use to generate compelling stories, character development, and dialogue. Real examples from published authors.",
      author: "David Kim",
      authorImage: null,
      readTime: "6 min read",
      likes: 634,
      comments: 42,
      tags: ["Creative Writing", "Claude", "Storytelling"],
      publishedAt: "6 hours ago",
      featured: false
    },
    {
      title: "Data Analysis with AI: Prompts for Every Dataset",
      excerpt: "Transform any dataset into actionable insights with these proven prompts. From exploratory analysis to predictive modeling, get the most out of your data.",
      author: "Maria Rodriguez",
      authorImage: null,
      readTime: "7 min read",
      likes: 445,
      comments: 23,
      tags: ["Data Science", "Analysis", "AI Tools"],
      publishedAt: "8 hours ago",
      featured: false
    }
  ]

  const categories = [
    { name: "Code & Development", icon: Code, count: "2.3k prompts", color: "text-blue-600" },
    { name: "AI Art & Design", icon: ImageIcon, count: "1.8k prompts", color: "text-purple-600" },
    { name: "Creative Writing", icon: PenTool, count: "1.5k prompts", color: "text-green-600" },
    { name: "Business & Productivity", icon: Brain, count: "1.2k prompts", color: "text-orange-600" },
    { name: "Research & Analysis", icon: Lightbulb, count: "980 prompts", color: "text-yellow-600" }
  ]

  const communityStats = [
    { label: "Active Writers", value: "12,847", icon: Users },
    { label: "Published Prompts", value: "45,623", icon: PenTool },
    { label: "Community Likes", value: "2.1M", icon: Heart },
    { label: "Weekly Readers", value: "89,234", icon: Eye }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Blog Style */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Where AI Prompts Come to Life
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover, share, and perfect AI prompts with a community of creators, developers, and innovators.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <SignInButton mode="modal">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                  Start Writing
                </Button>
              </SignInButton>
              <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                Explore Stories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {communityStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-1 md:mb-2">
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary mr-1 md:mr-2" />
                  <span className="text-lg md:text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold">Trending Now</h2>
            </div>
            
            {trendingPosts.slice(0, 1).map((post, index) => (
              <Card key={index} className="mb-6 md:mb-8 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-8">
                  <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    {post.authorImage ? (
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={48}
                        height={48}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm md:text-base">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm md:text-base">{post.author}</span>
                        <span className="text-muted-foreground hidden sm:inline">•</span>
                        <span className="text-xs md:text-sm text-muted-foreground">{post.publishedAt}</span>
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 leading-tight">{post.title}</h3>
                      <p className="text-muted-foreground mb-3 md:mb-4 leading-relaxed text-sm md:text-base line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                        <span>{post.readTime}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Grid */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold">Latest Stories</h2>
              <Button variant="outline" size="sm" className="text-sm">View All</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {trendingPosts.slice(1).map((post, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      {post.authorImage ? (
                        <Image
                          src={post.authorImage}
                          alt={post.author}
                          width={32}
                          height={32}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-xs md:text-sm">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs md:text-sm truncate">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2 leading-tight">{post.title}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mb-3">
                      <span>{post.readTime}</span>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Explore by Topic</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {categories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="mb-3 md:mb-4">
                      <category.icon className={`h-6 w-6 md:h-8 md:w-8 mx-auto ${category.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base mb-1 leading-tight">{category.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Join the Conversation</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Share your AI prompts, learn from others, and be part of a community that&apos;s shaping the future of AI interaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <SignInButton mode="modal">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                  Start Writing Today
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </SignInButton>
              <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                Browse Community
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
