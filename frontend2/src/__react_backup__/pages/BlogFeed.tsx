import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Filter,
  UserPlus,
  Users
} from 'lucide-react';
import { Blog, User as UserType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const BlogFeed = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [follows, setFollows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blogsRes, usersRes, followsRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/users'),
        fetch('/api/follows')
      ]);

      const blogsData = await blogsRes.json();
      const usersData = await usersRes.json();
      const followsData = await followsRes.json();

      // Enrich blogs with author data
      const enrichedBlogs = blogsData.map((blog: Blog) => ({
        ...blog,
        author: usersData.find((u: UserType) => u.id === blog.authorId)
      }));

      setBlogs(enrichedBlogs);
      setUsers(usersData);
      setFollows(followsData);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa učitavanjem blogova",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (blogId: string) => {
    if (!user) return;

    try {
      const blog = blogs.find(b => b.id === blogId);
      if (!blog) return;

      const isLiked = blog.likes.includes(user.id);
      const updatedLikes = isLiked 
        ? blog.likes.filter(id => id !== user.id)
        : [...blog.likes, user.id];

      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          likes: updatedLikes,
          likeCount: updatedLikes.length
        })
      });

      if (response.ok) {
        setBlogs(blogs.map(b => 
          b.id === blogId 
            ? { ...b, likes: updatedLikes, likeCount: updatedLikes.length }
            : b
        ));
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa lajkovanjem",
        variant: "destructive",
      });
    }
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!user) return;

    try {
      const isFollowing = follows.some(f => 
        f.followerId === user.id && f.followedId === targetUserId
      );

      if (isFollowing) {
        const followToRemove = follows.find(f => 
          f.followerId === user.id && f.followedId === targetUserId
        );
        
        await fetch(`/api/follows/${followToRemove.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        setFollows(follows.filter(f => f.id !== followToRemove.id));
      } else {
        const response = await fetch('/api/follows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            followerId: user.id,
            followedId: targetUserId,
            createdAt: new Date().toISOString()
          })
        });

        if (response.ok) {
          const newFollow = await response.json();
          setFollows([...follows, newFollow]);
        }
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa praćenjem",
        variant: "destructive",
      });
    }
  };

  const isFollowing = (targetUserId: string) => {
    if (!user) return false;
    return follows.some(f => 
      f.followerId === user.id && f.followedId === targetUserId
    );
  };

  const filteredBlogs = showFollowedOnly 
    ? blogs.filter(blog => 
        follows.some(f => 
          f.followerId === user?.id && f.followedId === blog.authorId
        )
      )
    : blogs;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (content: string, length: number = 150) => {
    const text = content.replace(/[#*`]/g, '').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="minimal-card animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-light tracking-wide mb-2">Blog Feed</h1>
            <p className="text-muted-foreground">
              Otkrijte najnovije priče i iskustva naših vodiča
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {user && (
              <Button
                variant={showFollowedOnly ? "default" : "ghost"}
                onClick={() => setShowFollowedOnly(!showFollowedOnly)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Samo praćeni</span>
              </Button>
            )}
            
            {user && (
              <Link to="/blog/create">
                <Button variant="zen" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Napravi blog</span>
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="minimal-card group hover:shadow-glow transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Link 
                      to={`/profile/${blog.author?.id}`}
                      className="flex items-center space-x-3 hover:opacity-75 transition-opacity"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={blog.author?.profileImage} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {blog.author?.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{blog.author?.username}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(blog.createdAt)}
                        </div>
                      </div>
                    </Link>
                    
                    {user && blog.authorId !== user.id && (
                      <Button
                        variant={isFollowing(blog.authorId) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => toggleFollow(blog.authorId)}
                        className="text-xs"
                      >
                        {isFollowing(blog.authorId) ? 'Prestani pratiti' : 'Prati'}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <Link to={`/blog/${blog.id}`} className="block group-hover:opacity-75 transition-opacity">
                    <h3 className="text-lg font-medium mb-3 leading-tight">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {getPreview(blog.content)}
                    </p>
                  </Link>
                </CardContent>

                <CardFooter className="pt-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(blog.id)}
                        className={`flex items-center space-x-1 text-xs ${
                          user && blog.likes.includes(user.id) 
                            ? 'text-red-500 hover:text-red-400' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        disabled={!user}
                      >
                        <Heart className={`w-4 h-4 ${
                          user && blog.likes.includes(user.id) ? 'fill-current' : ''
                        }`} />
                        <span>{blog.likeCount}</span>
                      </Button>

                      <Link to={`/blog/${blog.id}#comments`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{blog.commentCount}</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Nema blogova</h3>
            <p className="text-muted-foreground mb-6">
              {showFollowedOnly 
                ? "Korisnici koje pratite još nisu napisali blogove."
                : "Trenutno nema objavljenih blogova."
              }
            </p>
            {user && (
              <Link to="/blog/create">
                <Button variant="zen">
                  Napravi prvi blog
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogFeed;