import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image, X, Upload } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { username } = useAuthStore();
  const navigate = useNavigate();

  const validateImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const handleAddImage = () => {
    if (!imageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    if (!validateImageUrl(imageUrl)) {
      toast.error('Please enter a valid image URL (jpeg, jpg, gif, png)');
      return;
    }

    setImages([...images, imageUrl]);
    setImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    const file = files[0];

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);

        try {
          // Upload to IPFS or similar service
          const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
            },
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          const data = await response.json();
          const imageUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
          
          setImages([...images, imageUrl]);
          toast.success('Image uploaded successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload image. Please try again or use an image URL instead.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast.error('Please login to create a post');
      return;
    }

    setLoading(true);
    const permlink = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');

    // Create markdown for images
    const imageMarkdown = images.map(url => `![image](${url})`).join('\n');
    const fullBody = `${imageMarkdown}\n\n${body}`;

    const operations = [
      [
        'comment',
        {
          parent_author: '',
          parent_permlink: tags.split(' ')[0] || 'hive',
          author: username,
          permlink,
          title,
          body: fullBody,
          json_metadata: JSON.stringify({
            tags: tags.split(' '),
            image: images,
            app: 'hive-social'
          }),
        },
      ],
    ];

    try {
      window.hive_keychain.requestBroadcast(
        username,
        operations,
        'posting',
        (response: any) => {
          if (response.success) {
            toast.success('Post created successfully!');
            navigate('/posts');
          } else {
            toast.error('Failed to create post: ' + response.message);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Images
          </label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Image className="h-5 w-5 mr-2" />
                Add URL
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-5 w-5 mr-2" />
                {uploadLoading ? 'Uploading...' : 'Upload Image'}
              </button>
              {uploadLoading && (
                <span className="text-sm text-gray-500">Uploading your image...</span>
              )}
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Content (Markdown supported)
          </label>
          <div className="mt-1 flex gap-4">
            <div className={`flex-1 ${preview ? 'hidden' : 'block'}`}>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className={`flex-1 ${preview ? 'block' : 'hidden'}`}>
              <div className="prose max-w-none p-4 border rounded-md bg-gray-50">
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            {preview ? 'Show Editor' : 'Show Preview'}
          </button>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (space separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="hive blog news"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Send className="h-5 w-5 mr-2" />
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;