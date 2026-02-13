"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Bookmark as BookmarkIcon,
  Plus,
  Trash2,
  LogOut,
  ExternalLink,
  Search,
  Link as LinkIcon,
} from "lucide-react";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Validate form fields
  useEffect(() => {
    setIsFormValid(title.trim().length > 0 && url.trim().length > 0);
  }, [title, url]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
      } else {
        setUser(data.user);
        fetchBookmarks();
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBookmarks(bookmarks);
    } else {
      const filtered = bookmarks.filter((bookmark) =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredBookmarks(filtered);
    }
  }, [searchQuery, bookmarks]);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
  };

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      alert("Failed to add bookmark");
    } else {
      setTitle("");
      setUrl("");
      fetchBookmarks();
    }

    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    setDeleteDialog({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", deleteDialog.id);

    if (error) {
      console.error(error);
      alert("Delete failed");
    } else {
      fetchBookmarks();
    }

    setDeleteDialog(null);
  };

  const cancelDelete = () => {
    setDeleteDialog(null);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch {
      return url;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white border-b border-gray-200  bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <BookmarkIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Smart Bookmark
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-black-700 font-medium hidden sm:block px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {logoutLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Plus className="w-6 h-6 text-emerald-600" />
            Add new bookmark
          </h2>

          <form onSubmit={handleAddBookmark} className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g., React Documentation"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-gray-900 placeholder:text-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="https://example.com"
                  className="w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-gray-900 placeholder:text-gray-400"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full sm:w-auto px-8 py-3 text-base bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              {loading ? "Saving..." : "Save bookmark"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Your bookmarks
              </h2>
              <span className="text-base font-medium text-black-500">
                {bookmarks.length}{" "}
                {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredBookmarks.length === 0 && searchQuery && (
              <div className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base text-gray-500 font-medium">
                  No bookmarks match your search
                </p>
              </div>
            )}

            {filteredBookmarks.length === 0 && !searchQuery && (
              <div className="p-12 text-center">
                <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base text-gray-500 mb-1 font-medium">
                  No bookmarks yet
                </p>
                <p className="text-sm text-gray-400">
                  Start by adding your first bookmark above
                </p>
              </div>
            )}

            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="p-5 hover:bg-emerald-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between gap-4">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 group/link flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover/link:from-emerald-100 group-hover/link:to-teal-100 transition-colors">
                      <ExternalLink className="w-5 h-5 text-gray-600 group-hover/link:text-emerald-600 transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover/link:text-emerald-600 transition-colors line-clamp-1">
                        {bookmark.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {getDomain(bookmark.url)}
                      </p>
                    </div>
                  </a>

                  {/* Right side: Date + Delete */}
                  <div className="flex items-center gap-8 flex-shrink-0">
                    <p className="text-sm text-black-400 hidden sm:block">
                      {formatDate(bookmark.created_at)}
                    </p>

                    <button
                      onClick={() => handleDelete(bookmark.id, bookmark.title)}
                      className="p-2.5 text-black-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete bookmark?
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to delete this bookmark?
                </p>
                <p className="text-sm font-medium text-gray-900">
                  "{deleteDialog.title}"
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
