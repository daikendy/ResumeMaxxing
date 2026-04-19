import { calculateMatchScore } from './keywordMatcher';

const mockJD = "We are looking for a Senior Frontend Developer with expertise in React, TypeScript, and Tailwind CSS. Experience with Next.js and high-craft UI is required.";
const mockResume = {
  summary: "Experienced Senior Frontend Developer passionate about React and TypeScript.",
  experience: [
    { title: "Senior Developer", description: "Built high-craft UI using Next.js and Tailwind CSS." }
  ],
  skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"]
};

const score = calculateMatchScore(mockJD, mockResume);
console.log(`Test Match Score: ${score}%`);

if (score > 80) {
  console.log("SUCCESS: Logic correctly identified a high match.");
} else {
  console.log("FAILURE: Score was lower than expected for a perfect match.");
}
