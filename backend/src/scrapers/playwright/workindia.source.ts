import { chromium, type Page } from "playwright";
import type { JobSource, RawJob, JobSearchCriteria } from "../../types";

/**
 * Playwright scraper for WorkIndia public job listings.
 * Scrapes publicly accessible search results only.
 * Respects rate limits and does not bypass authentication.
 */
export class WorkIndiaPlaywrightSource implements JobSource {
  name = "workindia-playwright";

  async searchJobs(
    criteria: JobSearchCriteria,
    queries: string[]
  ): Promise<RawJob[]> {
    // Use the first relevant query
    const query = queries[0] ?? criteria.roles[0] ?? "developer";
    const location =
      criteria.locations.find((l) => l.toLowerCase() !== "remote india") ??
      criteria.locations[0] ??
      "";

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });

      const page = await context.newPage();

      // Build search URL
      const searchUrl = `https://www.workindia.in/jobs-in-${encodeURIComponent(
        location.toLowerCase().replace(/\s+/g, "-") || "india"
      )}/search?search_term=${encodeURIComponent(query)}`;

      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for job cards to load
      await page
        .waitForSelector('[class*="job-card"], [class*="jobCard"], article', {
          timeout: 10000,
        })
        .catch(() => null);

      const jobs = await this.extractJobsFromPage(page, query, location);
      return jobs;
    } catch (err) {
      console.error("[WorkIndia Playwright] Error:", err);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }

  private async extractJobsFromPage(
    page: Page,
    query: string,
    location: string
  ): Promise<RawJob[]> {
    try {
      return await page.evaluate(
        ({ source }: { source: string }) => {
          const jobs: RawJob[] = [];

          // Try multiple selector patterns for robustness
          const cards = document.querySelectorAll(
            '[class*="job-card"], [class*="jobCard"], [class*="job_card"], article[class*="job"]'
          );

          cards.forEach((card) => {
            const titleEl = card.querySelector(
              '[class*="title"], [class*="job-title"], h2, h3'
            );
            const companyEl = card.querySelector(
              '[class*="company"], [class*="employer"]'
            );
            const locationEl = card.querySelector('[class*="location"]');
            const descEl = card.querySelector(
              '[class*="desc"], [class*="summary"]'
            );
            const linkEl = card.querySelector("a[href]");

            const title = titleEl?.textContent?.trim();
            const company = companyEl?.textContent?.trim();
            const href = linkEl?.getAttribute("href");

            if (!title || !href) return;

            const jobUrl = href.startsWith("http")
              ? href
              : `https://www.workindia.in${href}`;

            jobs.push({
              title,
              company: company ?? "Unknown Company",
              location: locationEl?.textContent?.trim() ?? "India",
              description: descEl?.textContent?.trim() ?? "",
              skills: [],
              source,
              jobUrl,
            } as RawJob);
          });

          return jobs.slice(0, 20);
        },
        { source: this.name }
      );
    } catch {
      return [];
    }
  }
}
