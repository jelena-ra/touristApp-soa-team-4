import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Upload,
  X
} from 'lucide-react';
import { Blog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const BlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      const blogData = await response.json();
      
      if (!user || blogData.authorId !== user.id) {
        toast({
          title: "Nemate dozvolu",
          description: "Ne možete editovati tuđi blog",
          variant: "destructive",
        });
        navigate('/blog');
        return;
      }

      setBlog(blogData);
      setTitle(blogData.title);
      setContent(blogData.content);
      
      if (blogData.image) {
        setImagePreview(blogData.image);
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa učitavanjem bloga",
        variant: "destructive",
      });
      navigate('/blog');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !blog) return;

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Greška",
        description: "Naslov i sadržaj su obavezni",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updatedBlogData = {
        ...blog,
        title: title.trim(),
        content: content.trim(),
        image: image ? image.name : imagePreview,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedBlogData)
      });

      if (response.ok) {
        toast({
          title: "Blog ažuriran",
          description: "Vaš blog je uspešno ažuriran",
        });
        navigate(`/blog/${blog.id}`);
      } else {
        throw new Error('Failed to update blog');
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa ažuriranjem bloga",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return '';
    
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8 w-48" />
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="minimal-card">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-80 bg-muted rounded" />
                    <div className="h-32 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
              <Card className="minimal-card">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-muted rounded" />
                    <div className="h-8 bg-muted rounded" />
                    <div className="h-32 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !blog) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light mb-4">Blog nije pronađen</h2>
          <Button onClick={() => navigate('/blog')} variant="zen">
            Vrati se na blog feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/blog/${blog.id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Nazad</span>
            </Button>
            <div>
              <h1 className="text-3xl font-light tracking-wide">Izmeni blog</h1>
              <p className="text-muted-foreground">
                Ažurirajte sadržaj vašeg bloga
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="minimal-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-xl font-light">Sadržaj</h2>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Naslov *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Unesite naslov vašeg bloga..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Sadržaj * (Markdown podržan)</Label>
                    <Textarea
                      id="content"
                      placeholder="Napišite sadržaj vašeg bloga..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mt-2 min-h-[400px] font-mono text-sm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Slika (opciono)</Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Kliknite za upload</span> ili povucite sliku
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                          </div>
                          <input
                            id="image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !title.trim() || !content.trim()}
                      className="w-full flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Čuvanje...' : 'Sačuvaj izmene'}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="minimal-card sticky top-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <h2 className="text-xl font-light">Pregled</h2>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Blog preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  
                  {title && (
                    <h1 className="text-2xl font-light leading-tight">
                      {title}
                    </h1>
                  )}
                  
                  {content ? (
                    <div 
                      className="prose prose-invert max-w-none text-foreground text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: `<p class="mb-4">${renderMarkdown(content)}</p>` 
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">
                      Pregled će se pojaviti ovde dok kucate...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogEdit;