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
    You are an expert ATS-Optimization Career Coach. 
    Your job is to rewrite the user's resume bullet points to perfectly match the provided Job Description.
    
    CRITICAL RULES:
    1. STRICT TRUTH CONSTRAINT: You MUST NEVER invent fake experience or change the underlying technologies the user knows.
    If the user used Java, DO NOT change it to Python. You may only reframe the context of how they used their actual skills.
    2. Use strong action verbs and focus on impact/metrics.
    3. You MUST return the result as a strict JSON object matching the user's original data structure.
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
        print("✅ OpenAI request successful!")
        
        # Parse the AI's string response back into a Python dictionary
        tailored_json = json.loads(response.choices[0].message.content)
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
            "contact": {"name": "Mocked PDF Extraction", "email": "mock@test.com"},
            "experience": [{"title": "Mock PDF Reader", "company": "Mock Inc", "bullets": ["Read a PDF using Mocking."]}]
        }

    system_prompt = """
    You are an expert Resume Data Extractor.
    Your job is to read raw, unstructured text extracted from a user's PDF resume and perfectly map it to our strict JSON schema.
    
    CRITICAL RULES:
    1. NEVER invent data. Only extract what is present.
    2. Try your best to isolate Experience blocks into "title", "company", and a list of string "bullets".
    3. Extract Education: include "school", "degree", and "years".
    4. Extract Skills: a flat list of technical and soft skills.
    5. Extract Projects: include "title" and "description".
    
    Return exactly this JSON format:
    {
      "contact": { "name": "...", "email": "..." },
      "experience": [
         { "title": "...", "company": "...", "bullets": ["...", "..."] }
      ],
      "education": [
         { "school": "...", "degree": "...", "years": "..." }
      ],
      "skills": ["...", "..."],
      "projects": [
         { "title": "...", "description": "..." }
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