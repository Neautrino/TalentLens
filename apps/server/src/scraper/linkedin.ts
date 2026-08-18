function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?]+)/i);
  return match?.[1] ?? null;
}

export async function scrapeLinkedInProfile(profileUrl: string) {
  console.log(`Starting extraction for: ${profileUrl}\n`);
  
  const username = extractLinkedInUsername(profileUrl);
  if (!username) {
    throw new Error("Invalid LinkedIn profile URL.");
  }

  //Exa AI Search
  try {
    console.log("--- [Attempt 1] Trying Exa AI ---");
    if (!process.env.EXA_API_KEY) throw new Error("EXA_API_KEY missing");

    const exaQuery = `site:linkedin.com/in/${username}`;
    
    const exaResponse = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.EXA_API_KEY,
      },
      body: JSON.stringify({
        query: exaQuery,
        numResults: 1,
        useAutoprompt: true,
        contents: {
          text: true,
          highlights: true
        }
      }),
    });

    if (!exaResponse.ok) {
      throw new Error(`Exa API failed with status: ${exaResponse.status}`);
    }

    const exaData = await exaResponse.json();
    
    if (exaData.results && exaData.results.length > 0) {
      console.log("✅ Exa AI Success. Raw Data:\n");
      console.log(JSON.stringify(exaData.results[0], null, 2));
      return exaData.results[0];
    } else {
      throw new Error("Exa returned empty results.");
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ Exa AI Failed: ${errMsg}\n`);
  }

  // Fallback to Tavily Search
  try {
    console.log("--- [Attempt 2] Trying Tavily API ---");
    if (!process.env.TAVILY_API_KEY) throw new Error("TAVILY_API_KEY missing");

    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `LinkedIn profile of ${username} experience and education`,
        search_depth: "advanced",
        include_raw_content: true,
        max_results: 1,
        include_domains: ["linkedin.com"]
      }),
    });

    if (!tavilyResponse.ok) {
      throw new Error(`Tavily API failed with status: ${tavilyResponse.status}`);
    }

    const tavilyData = await tavilyResponse.json();
    
    if (tavilyData.results && tavilyData.results.length > 0) {
      console.log("✅ Tavily Success. Raw Data:\n");
      console.log(JSON.stringify(tavilyData.results[0], null, 2));
      return tavilyData.results[0];
    } else {
      throw new Error("Tavily returned empty results.");
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ Tavily Failed: ${errMsg}\n`);
  }

  // 3. Fallback to Scrapingdog
  try {
    console.log("--- [Attempt 3] Trying Scrapingdog API ---");
    if (!process.env.SCRAPINGDOG_API_KEY) throw new Error("SCRAPINGDOG_API_KEY missing");

    const scrapingDogUrl = `https://api.scrapingdog.com/linkedin/?api_key=${process.env.SCRAPINGDOG_API_KEY}&type=profile&linkId=${username}`;
    
    const dogResponse = await fetch(scrapingDogUrl, {
      method: "GET"
    });

    if (!dogResponse.ok) {
      throw new Error(`Scrapingdog API failed with status: ${dogResponse.status}`);
    }

    const dogData = await dogResponse.json();
    
    if (dogData && !dogData.error) {
      console.log("✅ Scrapingdog Success. Raw Data:\n");
      console.log(JSON.stringify(dogData, null, 2));
      return dogData;
    } else {
      throw new Error(dogData.error || "Scrapingdog returned empty or invalid results.");
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ Scrapingdog Failed: ${errMsg}\n`);
  }

  console.log("🚨 All scraping methods failed. Could not retrieve profile data.");
  return null;
}