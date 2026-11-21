"use client";

import { useState } from "react";
import type { Job } from "@/services/api";
import { saveJob, unsaveJob } from "@/services/api";

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: () => void;
}

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (n: number) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)} LPA`;
    return `₹${n.toLocaleString("en-IN")}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function getSourceBadgeColor(source: string): string {
  const colors: Record<string, string> = {
    adzuna: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    remoteok: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    "workindia-playwright": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  };
  return colors[source] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

function RelevanceMeter({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
      ? "bg-yellow-500"
      : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-10 text-right">
        {score}%
      </span>
    </div>
  );
}

export default function JobCard({ job, isSaved, onToggleSave }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveJob(job.id);
      } else {
        await saveJob(job.id);
      }
      onToggleSave();
    } catch {
      // If not logged in, just toggle locally
      onToggleSave();
    } finally {
      setSaving(false);
    }
  };

  const shortDesc = job.description.slice(0, 160);
  const hasMoreDesc = job.description.length > 160;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm leading-tight block truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {job.title}
            </a>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
              {job.company}
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              isSaved
                ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"
                : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
            }`}
            title={isSaved ? "Remove from saved" : "Save job"}
          >
            {isSaved ? "⭐" : "☆"}
          </button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            📍 {job.location}
          </span>
          {job.employmentType && (
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              💼 {job.employmentType}
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            💰 {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>

        {/* Relevance score */}
        {job.relevanceScore !== undefined && (
          <div className="mt-2">
            <RelevanceMeter score={job.relevanceScore} />
            {job.explanation && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                {job.explanation}
              </p>
            )}
          </div>
        )}

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  job.matchedSkills?.includes(skill)
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description toggle */}
      {job.description && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {expanded ? job.description : shortDesc}
            {hasMoreDesc && !expanded && "..."}
          </p>
          {hasMoreDesc && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${getSourceBadgeColor(job.source)}`}
        >
          {job.source}
        </span>
        <div className="flex items-center gap-3">
          {job.postedAt && (
            <span className="text-xs text-gray-400">
              {new Date(job.postedAt).toLocaleDateString("en-IN")}
            </span>
          )}
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Apply →
          </a>
        </div>
      </div>
    </div>
  );
}
