import React, { useState, useEffect } from "react";
import pb from "../pocketbase/api/pocketbase";
import { RecordModel } from "pocketbase";

interface PostType {
  id: string;
  title: string;
  description: string;
  content: string;
}

const Posts = () => {
  const [posts, setPosts] = useState<PostType[] | null>(null);

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const [isError, setIsError] = useState(false);

  const mapToPostType = (record: RecordModel): PostType => {
    return {
      id: record.id,
      title: record.title || "",
      description: record.description || "",
      content: record.content || "",
    };
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await pb.collection("posts").getFullList({
          sort: "-created",
        });

        const postsData = result.map(mapToPostType);

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const PostItem = ({
    title,
    description,
    content,
    index,
  }: {
    title: string;
    description: string;
    content: string;
    index: string | number;
  }) => {
    return (
      <>
        <div
          key={index}
          className="space-y-2 border-2 shadow-lg border-purple-300 rounded-lg p-5"
        >
          <h1 className="font-bold text-2xl text-purple-900">{title}</h1>
          <p className="font-light">Description: {description}</p>
          <p>{content}</p>
        </div>
      </>
    );
  };

  function createPost(postData: PostType) {
    setPosts((prevPosts) =>
      prevPosts ? [postData, ...prevPosts] : [postData]
    );
  }

  async function handleSubmit() {
    const data = {
      title: newPostTitle,
      description: newPostDescription,
      content: newPostContent,
    };

    try {
      if (newPostTitle && newPostDescription && newPostContent) {
        const record = await pb.collection("posts").create(data);
        const newPostData = mapToPostType(record);
        createPost(newPostData);

        setNewPostTitle("");
        setNewPostDescription("");
        setNewPostContent("");
      } else {
        setIsError(true);
        setTimeout(() => {
          setIsError(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  return (
    <>
      <div>
        <h2 className="text-center text-2xl">
          Read a post from Aaron's community, or write one yourself!
        </h2>
        <div className="flex flex-row">
          <div className="w-3/5 p-5 space-y-5">
            {posts?.map((post, i) => (
              <PostItem
                index={post.id}
                title={post.title}
                description={post.description}
                content={post.content}
              />
            ))}
          </div>
          <div className="w-2/5 p-5 space-y-5">
            <div className="space-y-2 border-2 shadow-lg border-purple-300 rounded-lg p-5">
              <div className="flex flex-col space-y-5">
                <div className="space-y-2">
                  <p className="font-bold text-xl">Title</p>
                  <input
                    placeholder="Your Title Here..."
                    className="text-lg py-2 px-4 w-full"
                    value={newPostTitle}
                    onChange={(event) => setNewPostTitle(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-xl">Description</p>
                  <input
                    placeholder="Your Description Here..."
                    className="text-lg py-2 px-4 w-full"
                    value={newPostDescription}
                    onChange={(event) =>
                      setNewPostDescription(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-xl">Content</p>
                  <textarea
                    placeholder="Your Content Here..."
                    className="text-lg py-2 px-4 w-full"
                    value={newPostContent}
                    onChange={(event) => setNewPostContent(event.target.value)}
                  />
                </div>
              </div>
              {isError && (
                <div className="flex justify-center">
                  <p className="text-red-500 text-lg">
                    You must fill out all fields before making a post
                  </p>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => handleSubmit()}
                  className="w-1/3 bg-purple-600 text-white font-light text-2xl rounded-md py-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Posts;
