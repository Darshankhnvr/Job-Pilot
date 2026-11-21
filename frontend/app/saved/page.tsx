"use client";

import { useState, useEffect } from "react";
import { getSavedJobs, type Job } from "@/services/api";
import JobCard from "@/components/JobCard";
import Link from "next/link";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getSavedJobs()
      .then((res) => {
        setJobs(res.jobs);
        setSavedIds(new Set(res.jobs.map((j) => j.id)));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSave = (jobId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        setJobs((j) => j.filter((job) => job.id !== jobId));
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">⭐ Saved Jobs</h1>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-16">
            Loading saved jobs...
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error} — Please sign in to view saved jobs.
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">☆</div>
            <p className="text-lg mb-2">No saved jobs yet</p>
            <p className="text-sm">
              Star jobs in the chat to save them here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300 underline text-sm"
            >
              Start searching →
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedIds.has(job.id)}
              onToggleSave={() => handleToggleSave(job.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
