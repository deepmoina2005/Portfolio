import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import MarkdownEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
import { MdDeleteForever } from "react-icons/md";

export default function Project({
  _id,
  title: existingTitle,
  slug: existingSlug,
  images: existingImages,
  description: existingDescription,
  projectcategory: existingprojectcategory,
  client: existingclient,
  livepreview: existingLivepreview,
  tags: existingTags,
  status: existingStatus,
}
) {
  const [redirect, setRedirect] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState(existingTitle || "");
  const [slug, setSlug] = useState(existingSlug || "");
  const [images, setImages] = useState(existingImages || []);
  const [description, setDescription] = useState(existingDescription || "");
  const [client, setClient] = useState(existingclient || "");
  const [projectcategory, setprojectcategory] = useState(
    existingprojectcategory || []
  );
  const [tags, setTags] = useState(existingTags || []);
  const [livepreview, setLivepreview] = useState(existingLivepreview || []);
  const [status, setStatus] = useState(existingStatus || "");

  // for images uploading
  const [isUploading, setIsUploading] = useState(false);
  const uploadImagesQueue = [];

  async function createBlog(ev) {
    ev.preventDefault();

    if (isUploading) {
      await Promise.all(uploadImagesQueue);
    }

    const data = {
      title,
      slug,
      images,
      description,
      client,
      projectcategory,
      livepreview,
      tags,
      status,
    };

    if (_id) {
      await axios.put("/api/projects", { ...data, _id });
      toast.success("Data updated");
    } else {
      await axios.post("/api/projects", data);
      toast.success("Projects Created");
    }

    setRedirect(true);
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);

      for (const file of files) {
        const data = new FormData();
        data.append("file", file);

        // use the axios.post method and push the promise to the queue
        uploadImagesQueue.push(
          axios.post("/api/upload", data).then((res) => {
            setImages((oldImages) => [...oldImages, ...res.data.links]);
          })
        );
      }

      // wait for all images to finish uploading

      await Promise.all(uploadImagesQueue);

      setIsUploading(false);
      toast.success("Images Uploaded");
    } else {
      toast.error("An error occurred!");
    }
  }

  if (redirect) {
    router.push("/projects");
    return null;
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function handleDeleteImage(index) {
    const updateImages = [...images];
    updateImages.splice(index, 1);
    setImages(updateImages);
    toast.success("Image Deleted Successfully");
  }

  // for slug url
  const handleSlugChange = (ev) => {
    const inputValue = ev.target.value;
    const newSlug = inputValue.replace(/\s+g/g, "-"); // replace spaces with hyphens

    setSlug(newSlug);
  };
  return (
    <>
      <form className="addWebsiteform" onSubmit={createBlog}>
        {/* blog title */}
        <div className="w-100 flex flex-col flex-left mb-2">
          <label className="title">Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter small title"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
          />
        </div>
        {/* blog slug url */}
        <div className="w-100 flex flex-col flex-left mb-2">
          <label htmlFor="slug">Slug (seo friendly url)</label>
          <input
            type="text"
            id="slug"
            placeholder="Enter Slug url"
            value={slug}
            onChange={handleSlugChange}
          />
        </div>
        {/* projects client Name */}
        <div className="w-100 flex flex-col flex-left mb-2">
          <label htmlFor="client">Client Name</label>
          <input
            type="text"
            id="client"
            placeholder="Enter client name"
            value={client}
            onChange={(ev) => setClient(ev.target.value)}
          />
        </div>
        {/* projects Livepreview */}
        <div className="w-100 flex flex-col flex-left mb-2">
          <label htmlFor="afilink">Live Link</label>
          <input
            type="text"
            id="slug"
            placeholder="Enter Link"
            value={livepreview}
            onChange={ev => setLivepreview(ev.target.value)}
          />
        </div>
        {/* blog category */}
        <div className="w-100 flex flex-col flex-left -mb-2">
          <label htmlFor="category">
            Select Category (for multi select press ctr + mouse left key)
          </label>
          <select
            onChange={(e) =>
              setprojectcategory(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            value={projectcategory}
            name="category"
            id="category"
            multiple
          >
            <option value="">Select Category</option>
            <option value="Website Development">Website Development</option>
            <option value="App Development">App Development</option>
            <option value="Design System">Design System</option>
            <option value="Website Migration">Website Migration</option>
            <option value="E-Commerce Site">E-Commerce Site</option>
            <option value="Performance Evaluation">
              Performance Evaluation
            </option>
          </select>
        </div>

        {/* blog image */}
        <div className="w-100 flex flex-col flex-left -mb-2">
          <div className="w-100">
            <label htmlFor="image">
              Images (first image will be show as thumbnail, you can drag)
            </label>
            <input
              type="file"
              id="fileInput"
              className="mt-1"
              accept="image/*"
              multiple
              onChange={uploadImages}
            />
          </div>
          <div className="w-100 flex flex-left mb-1">
            {isUploading && <Spinner />}
          </div>
        </div>
        {/* image preview and image sortable with deleted*/}
        {!isUploading && (
          <div className="flex">
            <ReactSortable
              list={Array.isArray(images) ? images : []}
              setList={updateImagesOrder}
              animation={200}
              className="flex gap-1"
            >
              {images?.map((link, index) => (
                <div key={link} className="uploadedimg">
                  <img src={link} alt="images" className="object-cover" />
                  <div className="deleteimg">
                    <button onClick={() => handleDeleteImage(index)}>
                      <MdDeleteForever />
                    </button>
                  </div>
                </div>
              ))}
            </ReactSortable>
          </div>
        )}
        {/* markdown description */}
        <div className="description w-100 flex flex-col flex-left mb-2">
          <label htmlFor="description">
            Blog Content (for image: first upload and copy link and paste in
            ![alt text](link))
          </label>
          <MarkdownEditor
            value={description}
            onChange={(ev) => setDescription(ev.text)}
            style={{ width: "100%", height: "400px" }}
            renderHTML={(text) => (
              <ReactMarkdown
                components={{
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return inline ? (
                      <code>{children}</code>
                    ) : match ? (
                      <div style={{ position: "relative" }}>
                        <pre
                          style={{
                            padding: "0",
                            borderRadius: "5px",
                            overflowX: "auto",
                            whiteSpace: "pre-wrap",
                          }}
                          {...props}
                        >
                          <code>{children}</code>
                        </pre>
                        <button
                          style={{
                            position: "absolute",
                            top: "0",
                            zIndex: "1",
                          }}
                          onClick={() =>
                            navigator.clipboard.writeText(children)
                          }
                        >
                          copy code
                        </button>
                      </div>
                    ) : (
                      <code {...props}>{children}</code>
                    );
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            )}
          />
        </div>

        {/* tags */}
        <div className="w-100 flex flex-col flex-left -mb-2">
          <label htmlFor="tags">Tags</label>
          <select
            onChange={(e) =>
              setTags(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            value={tags}
            name="tags"
            id="tags"
            multiple
          >
            <option value="html">html</option>
            <option value="css">css</option>
            <option value="javascript">javascript</option>
            <option value="nextjs">nextjs</option>
            <option value="reactjs">reactjs</option>
            <option value="database">database</option>
          </select>
        </div>

        {/* blog status */}
        <div className="w-100 flex flex-col flex-left mb-2">
          <label htmlFor="status">Status</label>
          <select
            onChange={(ev) => setStatus(ev.target.value)}
            value={status}
            name="status"
            id="status"
          >
            <option value="">No Select</option>
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
          </select>
        </div>

        <div className="w-100 mb-1">
          <button type="submit" className="w-100 addwebbtn flex-center">
            SAVE DATA
          </button>
        </div>
      </form>
    </>
  );
}
