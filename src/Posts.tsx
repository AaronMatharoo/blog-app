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
  const [showDeleteConfirm, setDeleteConfirm] = useState("");

  const [isError, setIsError] = useState(false);

  const mapToPostType = (record: RecordModel): PostType => {
    return {
      id: record.id,
      title: record.title || "",
      description: record.description || "",
      content: record.content || "",
    };
  };

  const TrashIcon = () => {
    return (
      <svg
        fill="currentColor"
        viewBox="0 0 16 16"
        height="1em"
        width="1em"
        color="red"
        // {...props}
      >
        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
        <path
          fillRule="evenodd"
          d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
        />
      </svg>
    );
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

  const deletePost = async (postID: string) => {
    await pb.collection("posts").delete(postID);
    const updatedArray = posts?.filter((obj) => obj.id !== postID);
    setPosts(updatedArray as PostType[]);
  };

  const PostItem = ({
    title,
    description,
    content,
    index,
  }: {
    title: string;
    description: string;
    content: string;
    index: string;
  }) => {
    return (
      <>
        <div
          key={index}
          className="grid grid-cols-12 border-2 shadow-lg border-purple-300 rounded-lg p-5"
        >
          {showDeleteConfirm === index ? (
            <div className="col-span-12 grid grid-rows-2 justify-center">
              <p className="font-semibold">
                Are you sure you want to delete the post {title}? This actions
                is irreversible!
              </p>
              <div className="flex justify-between mx-40">
                <button
                  className="bg-red-500 p-2 rounded-md"
                  onClick={() => deletePost(index)}
                >
                  <p className="font-semibold">DELETE</p>
                </button>
                <button
                  className="bg-purple-600 p-2 rounded-md"
                  onClick={() => setDeleteConfirm("")}
                >
                  <p className="text-white font-light">Cancel</p>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="col-span-11">
                <h1 className="font-bold text-2xl text-purple-900">{title}</h1>
                <p className="font-light">Description: {description}</p>
                <p>{content}</p>
              </div>
              <div className="col-span-1 flex justify-center items-center">
                <button
                  onClick={() => setDeleteConfirm(index)}
                  className="hover:bg-purple-300 h-8 w-8 flex justify-center items-center rounded-md"
                >
                  <TrashIcon />
                </button>
              </div>
            </>
          )}
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
