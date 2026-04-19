/**
 * Utilities for analyzing keyword alignment between job descriptions and resumes.
 */

const STOP_WORDS = new Set([
  'and', 'the', 'is', 'with', 'to', 'for', 'in', 'a', 'of', 'on', 'at', 'by', 
  'an', 'it', 'from', 'be', 'as', 'that', 'this', 'or', 'was', 'are', 'if',
  'opportunity', 'established', 'growth', 'involved', 'impressive', 'looking', 
  'candidate', 'role', 'team', 'work', 'experience', 'company', 'environment',
  'strong', 'hands-on', 'understanding', 'adept', 'skills', 'plus', 'benefits'
]);

/**
 * Calculates a match score based on keyword frequency alignment.
 * @param jobDescription The target job description text.
 * @param generatedResume The resume content object.
 * @returns A percentage score from 0 to 100.
 */
export function calculateMatchScore(jobDescription: string, generatedResume: any): number {
  if (!jobDescription || !generatedResume) return 0;

  // 1. Clean and tokenize JD
  const jdText = jobDescription.toLowerCase();
  const jdWords = jdText
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));

  const uniqueJdKeywords = Array.from(new Set(jdWords));
  if (uniqueJdKeywords.length === 0) return 0;

  // 2. Map JD keywords to weights
  // Heuristic: Short capitalized-looking words or common tech patterns get more weight
  const weightedKeywords = uniqueJdKeywords.map(word => {
    let weight = 1;
    // Check if it looks like a technical term (e.g. AWS, SQS, API, CI/CD)
    if (word.length <= 5 && word.toUpperCase() === word) weight = 3;
    if (word.includes('-') || word.includes('/')) weight = 2; // e.g. CI/CD, Javascript/Typescript
    return { word, weight };
  });

  const totalPossibleWeight = weightedKeywords.reduce((acc, k) => acc + k.weight, 0);

  // 3. Flatten resume and extract its identified skills for triple-weight matching
  const resumeContent = typeof generatedResume === 'string' ? generatedResume : JSON.stringify(generatedResume);
  const resumeString = resumeContent.toLowerCase();
  
  // Extract explicit skills from the resume object if available
  const explicitSkills = (generatedResume.skills || []).map((s: string) => s.toLowerCase());

  // 4. Calculate earned weight
  let earnedWeight = 0;
  weightedKeywords.forEach(k => {
    // Check if the JD keyword exists in the resume
    if (resumeString.includes(k.word)) {
      let situationalWeight = k.weight;
      
      // Triple weight if this JD keyword is explicitly listed in the resume's Skills matrix
      if (explicitSkills.some((s: string) => s.includes(k.word) || k.word.includes(s))) {
        situationalWeight *= 1.5;
      }
      
      earnedWeight += situationalWeight;
    }
  });

  // 5. Final calculation
  const score = (earnedWeight / totalPossibleWeight) * 100;
  return Math.min(100, Math.round(score));
}
