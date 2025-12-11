"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/project";
import { Upload, X, Plus, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Web Development",
  "Mobile App",
  "Desktop App",
  "API/Backend",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Blockchain",
  "Game Development",
  "Other",
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // File states - store actual files
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [imagesPreviews, setImagesPreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string | null>(null);

  // Refs for file inputs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imageInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file
      setImageFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setZipFile(file);
      setZipFileName(file.name);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = null;
      return newFiles;
    });
    setImagesPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = null;
      return newPreviews;
    });
    if (imageInputRefs[index].current) {
      imageInputRefs[index].current!.value = "";
    }
  };

  const removeZip = () => {
    setZipFile(null);
    setZipFileName(null);
    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Create FormData manually and append files
    const formData = new FormData(e.currentTarget);

    // Append files manually from state (this is the key fix!)
    if (thumbnailFile) {
      formData.set("thumbnail", thumbnailFile);
    }

    imageFiles.forEach((file, index) => {
      if (file) {
        formData.set(`image${index}`, file);
      }
    });

    if (zipFile) {
      formData.set("zipFile", zipFile);
    }

    // Debug: Log all form entries
    console.log("🔍 FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    try {
      const result = await createProject(formData);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Project
          </h1>
          <p className="text-gray-600 mb-8">
            List your project on the marketplace and start earning
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="E.g., E-commerce Dashboard with Analytics"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe your project in detail. Include features, tech stack, what makes it unique..."
              />
            </div>

            {/* Price and Category */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="999"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label
                htmlFor="techStack"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tech Stack <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="React, Node.js, MongoDB, Tailwind CSS (comma separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate technologies with commas
              </p>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Image
              </label>
              <div className="mt-2">
                {/* Hidden file input - ALWAYS in DOM */}
                <input
                  ref={thumbnailInputRef}
                  id="thumbnail-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />

                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-32 w-auto rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="thumbnail-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Click to upload thumbnail
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Project Screenshots (up to 5) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Screenshots <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload up to 5 screenshots
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index}>
                    {/* Hidden file input - ALWAYS in DOM */}
                    <input
                      ref={imageInputRefs[index]}
                      id={`image-input-${index}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImagesChange(e, index)}
                    />

                    {imagesPreviews[index] ? (
                      <div className="relative">
                        <img
                          src={imagesPreviews[index]!}
                          alt={`Screenshot ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`image-input-${index}`}
                        className="flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Add image</p>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ZIP File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ZIP File
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload your project files (only accessible to buyers after
                purchase)
              </p>

              {/* Hidden file input - ALWAYS in DOM */}
              <input
                ref={zipInputRef}
                id="zip-input"
                type="file"
                className="hidden"
                accept=".zip"
                onChange={handleZipChange}
              />

              {zipFileName ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded">
                      <Upload className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {zipFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeZip}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="zip-input"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload ZIP file
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label
                htmlFor="videoUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Demo Video URL
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Live Project URL */}
            <div>
              <label
                htmlFor="projectUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Live Project URL
              </label>
              <input
                type="url"
                id="projectUrl"
                name="projectUrl"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://your-project.com"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
