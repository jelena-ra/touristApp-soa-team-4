import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Blog, Comment, User as UserType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    if (id) {
      fetchBlogData();
    }
  }, [id]);

  const fetchBlogData = async () => {
    try {
      const [blogRes, commentsRes, usersRes] = await Promise.all([
        fetch(`/api/blogs/${id}`),
        fetch(`/api/comments?blogId=${id}`),
        fetch('/api/users')
      ]);

      const blogData = await blogRes.json();
      const commentsData = await commentsRes.json();
      const usersData = await usersRes.json();

      // Enrich with author data
      const enrichedBlog = {
        ...blogData,
        author: usersData.find((u: UserType) => u.id === blogData.authorId)
      };

      const enrichedComments = commentsData.map((comment: Comment) => ({
        ...comment,
        author: usersData.find((u: UserType) => u.id === comment.authorId)
      }));

      setBlog(enrichedBlog);
      setComments(enrichedComments);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa učitavanjem bloga",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!user || !blog) return;

    try {
      const isLiked = blog.likes.includes(user.id);
      const updatedLikes = isLiked 
        ? blog.likes.filter(id => id !== user.id)
        : [...blog.likes, user.id];

      const response = await fetch(`/api/blogs/${blog.id}`, {
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
        setBlog({
          ...blog,
          likes: updatedLikes,
          likeCount: updatedLikes.length
        });
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa lajkovanjem",
        variant: "destructive",
      });
    }
  };

  const addComment = async () => {
    if (!user || !blog || !newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          content: newComment,
          authorId: user.id,
          blogId: blog.id,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        const enrichedComment = {
          ...newCommentData,
          author: user
        };
        
        setComments([...comments, enrichedComment]);
        setBlog({
          ...blog,
          commentCount: blog.commentCount + 1
        });
        setNewComment('');
        
        toast({
          title: "Komentar dodat",
          description: "Vaš komentar je uspešno objavljen",
        });
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa dodavanjem komentara",
        variant: "destructive",
      });
    }
  };

  const editComment = async (commentId: string) => {
    if (!user || !editCommentText.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          content: editCommentText,
          updatedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setComments(comments.map(c => 
          c.id === commentId 
            ? { ...c, content: editCommentText, updatedAt: new Date().toISOString() }
            : c
        ));
        setEditingComment(null);
        setEditCommentText('');
        
        toast({
          title: "Komentar ažuriran",
          description: "Vaš komentar je uspešno ažuriran",
        });
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa ažuriranjem komentara",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        if (blog) {
          setBlog({
            ...blog,
            commentCount: blog.commentCount - 1
          });
        }
        
        toast({
          title: "Komentar obrisan",
          description: "Komentar je uspešno obrisan",
        });
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa brisanjem komentara",
        variant: "destructive",
      });
    }
  };

  const deleteBlog = async () => {
    if (!user || !blog) return;

    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Blog obrisan",
          description: "Blog je uspešno obrisan",
        });
        navigate('/blog');
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa brisanjem bloga",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-medium mb-4 mt-8">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-light mb-6 mt-8">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-medium">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br />');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8 w-32" />
            <Card className="minimal-card mb-8">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
                <div className="h-8 bg-muted rounded mb-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light mb-4">Blog nije pronađen</h2>
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
        {/* Back Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/blog">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Nazad na blog feed</span>
            </Button>
          </Link>
        </motion.div>

        {/* Blog Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="minimal-card mb-8">
            <CardHeader>
              <div className="flex items-center justify-between mb-6">
                <Link 
                  to={`/profile/${blog.author?.id}`}
                  className="flex items-center space-x-4 hover:opacity-75 transition-opacity"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={blog.author?.profileImage} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {blog.author?.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{blog.author?.username}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(blog.createdAt)}
                      {blog.updatedAt !== blog.createdAt && (
                        <span className="ml-2">(ažurirano)</span>
                      )}
                    </div>
                  </div>
                </Link>

                {user && user.id === blog.authorId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="minimal-card">
                      <DropdownMenuItem asChild>
                        <Link 
                          to={`/blog/edit/${blog.id}`}
                          className="flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Izmeni blog
                        </Link>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Obriši blog
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="minimal-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Potvrdi brisanje</AlertDialogTitle>
                            <AlertDialogDescription>
                              Da li ste sigurni da želite da obrišete ovaj blog? 
                              Ova akcija se ne može poništiti.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Otkaži</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={deleteBlog}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Obriši blog
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <h1 className="text-3xl font-light leading-tight mb-6">
                {blog.title}
              </h1>
            </CardHeader>

            <CardContent>
              <div 
                className="prose prose-invert max-w-none text-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-4">${renderMarkdown(blog.content)}</p>` 
                }}
              />

              <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={toggleLike}
                  className={`flex items-center space-x-2 ${
                    user && blog.likes.includes(user.id) 
                      ? 'text-red-500 hover:text-red-400' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={!user}
                >
                  <Heart className={`w-5 h-5 ${
                    user && blog.likes.includes(user.id) ? 'fill-current' : ''
                  }`} />
                  <span>{user && blog.likes.includes(user.id) ? 'Ukloni lajk' : 'Sviđa mi se'}</span>
                  <Badge variant="secondary">{blog.likeCount}</Badge>
                </Button>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MessageCircle className="w-5 h-5" />
                  <span>{blog.commentCount} komentara</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          id="comments"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="minimal-card">
            <CardHeader>
              <h2 className="text-xl font-light">Komentari ({comments.length})</h2>
            </CardHeader>

            <CardContent>
              {/* Add Comment */}
              {user && (
                <div className="mb-8 p-4 border border-border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Dodaj komentar..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3 min-h-[80px] resize-none"
                      />
                      <Button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Dodaj komentar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Link to={`/profile/${comment.author?.id}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author?.profileImage} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {comment.author?.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link 
                          to={`/profile/${comment.author?.id}`}
                          className="font-medium text-sm hover:opacity-75 transition-opacity"
                        >
                          {comment.author?.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <span className="ml-1">(ažurirano)</span>
                          )}
                        </span>
                        
                        {user && user.id === comment.authorId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="minimal-card">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                              >
                                <Edit className="w-3 h-3 mr-2" />
                                Uredi komentar
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Obriši komentar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="minimal-card">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Potvrdi brisanje</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Da li ste sigurni da želite da obrišete ovaj komentar?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Otkaži</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteComment(comment.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Obriši komentar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {editingComment === comment.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="min-h-[60px] resize-none"
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => editComment(comment.id)}
                              disabled={!editCommentText.trim()}
                            >
                              Sačuvaj
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingComment(null);
                                setEditCommentText('');
                              }}
                            >
                              Otkaži
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground leading-relaxed">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nema komentara</p>
                    {user && (
                      <p className="text-sm mt-1">Budite prvi koji će komentarisati!</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetail;