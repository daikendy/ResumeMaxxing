import json
import asyncio
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# 1. THE SWITCH: You physically change this word to True or False
MOCK_MODE = False

async def tailor_resume(raw_resume: dict, job_description: str, job_title: str) -> dict:
    """
    Takes the user's raw resume and the job description, 
    returns a JSON object with the tailored resume.
    """

    if MOCK_MODE:
        print("⚡ MOCK MODE ACTIVE: Bypassing OpenAI API...")
        await asyncio.sleep(2) # Simulate the network delay so frontend loading states work
        
        # Return fake but perfectly formatted JSON
        return {
            "contact": raw_resume.get("contact", {}),
            "experience": [
                {
                    "title": f"Tailored: {job_title}",
                    "company": "Mocked Company",
                    "bullets": [
                        "Successfully bypassed the ATS using optimized keywords.",
                        "Engineered a perfectly mocked database save state."
                    ]
                }
            ]
        }
    
    system_prompt = """
    You are an expert ATS-Optimization Career Coach and a high-precision ATS-compliant machine.
    Your job is to rewrite the user's resume JSON to perfectly align with the provided Target Job Description and Target Job Title.
    
    CRITICAL RULES:
    1. STRICT TRUTH CONSTRAINT: You MUST NEVER invent fake experience.
    2. ANTI-HALLUCINATION GUARDRAIL: DO NOT add any technologies (e.g., Python, Docker) if they are not explicitly listed in the User's Master Profile JSON. 
    3. EXPERIENCE INTEGRITY: Even if a skill (like Python) is in the user's "Skills" list, DO NOT add it to a specific company's "Experience" bullet points unless it was already mentioned in the original description of that specific role. Do not "leak" skills into roles where they weren't used.
    4. MANDATORY SECTION PRESERVATION: You MUST return a complete JSON object containing EVERY section: 'contact', 'experience', 'education', 'skills', and 'projects'.
    5. TAILORING LOGIC: 
       - Experience: Rewrite bullet points for impact using JD keywords. You MUST use markdown bolding (**text**) to highlight key tools, metrics, or achievements (e.g., "**Python**", "**+45% efficiency**").
       - Projects: Rephrase to align with the role, keeping tool context.
       - Skills: Curate for relevance, keeping ONLY what the user knows.
    6. LARGE JOB DESCRIPTIONS: If the JD is very long, prioritize the "Requirements," "Qualifications," and "Responsibilities" sections.
    7. DATA INTEGRITY: You MUST strictly PRESERVE the following fields if they exist in the user's master profile: 'startDate', 'endDate', 'location', and 'technologies'. Do NOT delete or modify them unless they are empty.
    8. Return strict JSON that mirrors the user's master profile structure perfectly.
    """

    user_prompt = f"""
    Target Job Title: {job_title}
    Target Job Description: {job_description}
    
    My Current Resume JSON:
    {json.dumps(raw_resume)}
    """

    try:
        print("⚡ Sending request to OpenAI...")
        response = await client.chat.completions.create(
            model="gpt-4o-mini", # Super fast, cheap, perfect for MVP
            response_format={ "type": "json_object" }, # Forces strict JSON output
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            timeout=15.0  # Fails fast instead of hanging forever
        )
        # Log the raw response for debugging
        raw_content = response.choices[0].message.content
        print(f"🤖 AI RAW CONTENT: {raw_content[:500]}...")
        
        # Parse the AI's string response back into a Python dictionary
        tailored_json = json.loads(raw_content)
        return tailored_json
        
    except Exception as e:
        print(f"❌ OPENAI ERROR: {type(e).__name__} - {str(e)}")
        # Raise it so the router can intercept it or fail cleanly
        raise Exception(f"OpenAI Failed: {str(e)}")


async def extract_resume_data(pdf_text: str) -> dict:
    """
    Takes raw messy PDF text and structures it into the target MasterResume JSON format.
    """
    
    if MOCK_MODE:
        return {
            "contact": {"name": "Mocked PDF Extraction", "email": "mock@test.com", "phone": "+1 555-0000", "github": "github.com/mock", "linkedin": "linkedin.com/in/mock"},
            "experience": [{"title": "Mock PDF Reader", "company": "Mock Inc", "bullets": ["Read a PDF using Mocking."]}]
        }

    system_prompt = """
    You are an expert Resume Data Extractor.
    Your job is to read raw, unstructured text extracted from a user's PDF resume and perfectly map it to our strict JSON schema.
    
    CRITICAL RULES:
    1. NEVER invent data. Only extract what is present.
    2. Extract Experience: include "title", "company", "location", "startDate", "endDate", "technologies", and a list of "bullets". 
    3. Extract Education: include "institution", "degree", and "year".
    4. Extract Skills: a flat list of technical and soft skills.
    5. Extract Projects: include "title", "description", "startDate", "endDate", and "technologies".
    6. CONTACT DETAILS: Extract ALL available contact info:
       - "phone": The candidate's phone number (any format).
       - "github": GitHub profile URL or username. May appear as a hyperlink URL (e.g., https://github.com/username). Return just the URL without https:// prefix.
       - "linkedin": LinkedIn profile URL or username. May appear as a hyperlink URL (e.g., https://linkedin.com/in/username). Return just the URL without https:// prefix.
       - NOTE: The text may contain a "[HYPERLINKS]" section at the end with URLs extracted from PDF annotations. Cross-reference these with any visible link text in the resume body to identify GitHub and LinkedIn URLs.
    7. If a field is not found, set it to an empty string "". Do NOT omit it.
    
    Return exactly this JSON format:
    {
      "contact": { "name": "...", "email": "...", "phone": "...", "github": "...", "linkedin": "..." },
      "experience": [
         { "title": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "technologies": "...", "bullets": ["..."] }
      ],
      "education": [
         { "institution": "...", "degree": "...", "year": "..." }
      ],
      "skills": ["..."],
      "projects": [
         { "title": "...", "description": "...", "startDate": "...", "endDate": "...", "technologies": "..." }
      ]
    }
    """

    user_prompt = f"Raw Resume Text:\n{pdf_text}"

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            timeout=15.0
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ OPENAI ERROR (PDF PARSE): {str(e)}")
        raise Exception(f"Failed to parse PDF using OpenAI: {str(e)}")
