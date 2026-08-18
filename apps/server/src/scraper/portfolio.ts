function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function categorizeLinks(html: string, baseUrl: string) {
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  
  const baseDomain = new URL(baseUrl).hostname.replace('www.', '');

  const linkRegex = /href=["'](https?:\/\/[^"']+|\/[^"']+)["']/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const rawHref = match[1];
    if (!rawHref) continue;
    
    const resolved = resolveUrl(baseUrl, rawHref);
    if (!resolved) continue;

    try {
      const resolvedUrlObj = new URL(resolved);
      const isInternal = resolvedUrlObj.hostname.includes(baseDomain);

      if (resolved.includes('#') || resolved.startsWith('mailto:')) continue;

      if (isInternal) {
        // Enforce 1-level depth relative to the base URL
        // e.g., allow /about, but block /blog/my-post
        const basePath = new URL(baseUrl).pathname.replace(/\/$/, '');
        const targetPath = resolvedUrlObj.pathname.replace(/\/$/, '');
        
        const relativePath = targetPath.startsWith(basePath) 
          ? targetPath.slice(basePath.length) 
          : targetPath;
          
        const depth = relativePath.split('/').filter(p => p.length > 0).length;
        
        if (depth <= 1) {
          internalLinks.add(resolved);
        }
      } else {
        if (!resolvedUrlObj.hostname.includes("linkedin.com/share")) {
          externalLinks.add(resolved);
        }
      }
    } catch {
      continue;
    }
  }

  return {
    internal: Array.from(internalLinks),
    external: Array.from(externalLinks)
  };
}

export async function scrapePortfolio(portfolioUrl: string, maxPages = 5) {
  console.log(`\nStarting Portfolio Crawl for: ${portfolioUrl}`);
  
  try {
    const htmlResponse = await fetch(portfolioUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    
    if (!htmlResponse.ok) {
      throw new Error(`Failed to access portfolio homepage. Status: ${htmlResponse.status}`);
    }
    
    const htmlContent = await htmlResponse.text();

    const { internal, external } = categorizeLinks(htmlContent, portfolioUrl);

    const highValueKeywords = ['about', 'project', 'work', 'resume', 'experience', 'portfolio'];
    
    const priorityLinks = internal.filter(link => 
      highValueKeywords.some(keyword => link.toLowerCase().includes(keyword))
    );

    const pagesToScrape = [portfolioUrl];
    for (const link of priorityLinks) {
      if (pagesToScrape.length >= maxPages) break;
      if (!pagesToScrape.includes(link)) pagesToScrape.push(link);
    }

    console.log(`Crawling ${pagesToScrape.length} pages internally...`);
    console.log(`Found ${external.length} external links...`);

    const scrapePromises = pagesToScrape.map(async (url) => {
      try {
        const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
          headers: { "Accept": "text/markdown" }
        });
        
        if (jinaRes.ok) {
          const markdown = await jinaRes.text();
          return `\n\n### --- PAGE: ${url} ---\n\n${markdown}`;
        }
        return `\n\n### --- PAGE: ${url} ---\n\n[Failed to scrape]`;
      } catch (e) {
        return `\n\n### --- PAGE: ${url} ---\n\n[Error scraping]`;
      }
    });

    const scrapedPages = await Promise.all(scrapePromises);
    const combinedMarkdown = scrapedPages.join('\n');

    const result = {
      domain: new URL(portfolioUrl).hostname,
      pages_scraped: pagesToScrape.length,
      external_links: external,
      content: combinedMarkdown
    };

    console.log("✅ Portfolio Scraped Successfully.");
    return result;

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ Portfolio Scrape Failed: ${errMsg}`);
    return null;
  }
}