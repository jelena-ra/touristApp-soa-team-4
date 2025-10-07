import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, 
  MapPin,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  UserPlus,
  UserMinus,
  Edit,
  Mail,
  Quote
} from 'lucide-react';
import { User, Blog, Follow } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [likedBlogs, setLikedBlogs] = useState<Blog[]>([]);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === id;
  const profileUserId = id || currentUser?.id;

  useEffect(() => {
    if (profileUserId) {
      fetchProfileData();
    }
  }, [profileUserId]);

  const fetchProfileData = async () => {
    try {
      const [userRes, blogsRes, followsRes] = await Promise.all([
        fetch(`/api/users/${profileUserId}`),
        fetch(`/api/blogs?authorId=${profileUserId}`),
        fetch('/api/follows')
      ]);

      const userData = await userRes.json();
      const blogsData = await blogsRes.json();
      const followsData = await followsRes.json();

      // Get all blogs to find liked ones
      const allBlogsRes = await fetch('/api/blogs');
      const allBlogsData = await allBlogsRes.json();
      const userLikedBlogs = allBlogsData.filter((blog: Blog) => 
        blog.likes.includes(profileUserId!)
      );

      // Enrich blogs with author data
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      
      const enrichedBlogs = blogsData.map((blog: Blog) => ({
        ...blog,
        author: usersData.find((u: User) => u.id === blog.authorId)
      }));

      const enrichedLikedBlogs = userLikedBlogs.map((blog: Blog) => ({
        ...blog,
        author: usersData.find((u: User) => u.id === blog.authorId)
      }));

      // Get followers and following
      const userFollowers = followsData.filter((f: Follow) => f.followedId === profileUserId);
      const userFollowing = followsData.filter((f: Follow) => f.followerId === profileUserId);

      setUser(userData);
      setBlogs(enrichedBlogs);
      setLikedBlogs(enrichedLikedBlogs);
      setFollowers(userFollowers);
      setFollowing(userFollowing);
      setFollows(followsData);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa učitavanjem profila",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser || !user || isOwnProfile) return;

    try {
      const isFollowing = follows.some(f => 
        f.followerId === currentUser.id && f.followedId === user.id
      );

      if (isFollowing) {
        const followToRemove = follows.find(f => 
          f.followerId === currentUser.id && f.followedId === user.id
        );
        
        await fetch(`/api/follows/${followToRemove!.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });

        setFollows(follows.filter(f => f.id !== followToRemove!.id));
        setFollowers(followers.filter(f => f.id !== followToRemove!.id));
      } else {
        const response = await fetch('/api/follows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({
            followerId: currentUser.id,
            followedId: user.id,
            createdAt: new Date().toISOString()
          })
        });

        if (response.ok) {
          const newFollow = await response.json();
          setFollows([...follows, newFollow]);
          setFollowers([...followers, newFollow]);
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

  const isCurrentlyFollowing = () => {
    if (!currentUser || !user) return false;
    return follows.some(f => 
      f.followerId === currentUser.id && f.followedId === user.id
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (content: string, length: number = 100) => {
    const text = content.replace(/[#*`]/g, '').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <Card className="minimal-card mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-muted rounded-full" />
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="minimal-card">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-light mb-4">Korisnik nije pronađen</h2>
          <Link to="/blog">
            <Button variant="zen">Vrati se na blog feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="minimal-card mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-light mb-2">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.username
                        }
                      </h1>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      {!isOwnProfile && currentUser && (
                        <Button
                          onClick={toggleFollow}
                          variant={isCurrentlyFollowing() ? "default" : "zen"}
                          className="flex items-center space-x-2"
                        >
                          {isCurrentlyFollowing() ? (
                            <>
                              <UserMinus className="w-4 h-4" />
                              <span>Prestani pratiti</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              <span>Prati</span>
                            </>
                          )}
                        </Button>
                      )}
                      
                      {isOwnProfile && (
                        <Link to="/profile/edit">
                          <Button variant="ghost" className="flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Izmeni profil</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-6 text-sm">
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Pridružen {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                    
                    {user.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    
                    {user.bio && (
                      <p className="text-foreground leading-relaxed">
                        {user.bio}
                      </p>
                    )}
                    
                    {user.motto && (
                      <div className="flex items-start space-x-2 text-sm italic text-muted-foreground">
                        <Quote className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>"{user.motto}"</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{followers.length} pratilaca</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{following.length} prati</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs defaultValue="blogs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blogs">
                {isOwnProfile ? 'Moji blogovi' : 'Blogovi'} ({blogs.length})
              </TabsTrigger>
              <TabsTrigger value="liked">
                {isOwnProfile ? 'Lajkovani' : 'Lajkovi'} ({likedBlogs.length})
              </TabsTrigger>
              <TabsTrigger value="following">
                Prati ({following.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blogs">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="minimal-card group hover:shadow-glow transition-all duration-300 h-full">
                      <CardHeader className="pb-3">
                        <Link 
                          to={`/blog/${blog.id}`}
                          className="block group-hover:opacity-75 transition-opacity"
                        >
                          <h3 className="text-lg font-medium mb-2 leading-tight line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {getPreview(blog.content)}
                          </p>
                        </Link>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{blog.likeCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{blog.commentCount}</span>
                            </div>
                          </div>
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                {blogs.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      {isOwnProfile ? 'Nemate objavljenih blogova' : 'Nema objavljenih blogova'}
                    </h3>
                    {isOwnProfile && (
                      <Link to="/blog/create">
                        <Button variant="zen" className="mt-4">
                          Napravi prvi blog
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="liked">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {likedBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="minimal-card group hover:shadow-glow transition-all duration-300 h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2 mb-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={blog.author?.profileImage} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {blog.author?.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Link 
                            to={`/profile/${blog.author?.id}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            @{blog.author?.username}
                          </Link>
                        </div>
                        
                        <Link 
                          to={`/blog/${blog.id}`}
                          className="block group-hover:opacity-75 transition-opacity"
                        >
                          <h3 className="text-lg font-medium mb-2 leading-tight line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {getPreview(blog.content)}
                          </p>
                        </Link>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                              <span>{blog.likeCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{blog.commentCount}</span>
                            </div>
                          </div>
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                {likedBlogs.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      {isOwnProfile ? 'Nemate lajkovanih blogova' : 'Nema lajkovanih blogova'}
                    </h3>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="following">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {following.map((follow, index) => {
                  // Note: In a real app, you'd fetch the user data for each followed user
                  // For demo purposes, we'll show placeholder data
                  return (
                    <motion.div
                      key={follow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="minimal-card group hover:shadow-glow transition-all duration-300">
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                U{follow.followedId}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Link 
                                to={`/profile/${follow.followedId}`}
                                className="font-medium hover:opacity-75 transition-opacity"
                              >
                                Korisnik {follow.followedId}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                Prati od {formatDate(follow.createdAt)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                
                {following.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      {isOwnProfile ? 'Ne pratite nikoga' : 'Ne prati nikoga'}
                    </h3>
                    {isOwnProfile && (
                      <p className="text-muted-foreground">
                        Idite na blog feed da pronađete zanimljive autore za praćenje
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;